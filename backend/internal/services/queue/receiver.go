package queue

import (
	"app/internal/lib/types"
	"encoding/json"
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

type MessageHandler func(*types.Submission) error

func Receive(rabbitMQURL string, handler MessageHandler) error {
	// Connect to RabbitMQ
	conn, err := amqp091.Dial(rabbitMQURL)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}
	defer conn.Close()

	// Open a channel
	ch, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %w", err)
	}
	defer ch.Close()

	// Declare the submissions queue
	q, err := ch.QueueDeclare(
		"submissions", // queue name
		true,          // durable (survive broker restart)
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return fmt.Errorf("failed to set QoS: %w", err)
	}

	// Start consuming messages
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer tag (auto-generated)
		false,  // auto-ack (we'll manually ack)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	// Process messages in an infinite loop
	for msg := range msgs {
		processMessage(msg, handler)
	}

	return nil
}

// processMessage unmarshals the message and calls the handler
func processMessage(msg amqp091.Delivery, handler MessageHandler) {

	var submission types.Submission
	if err := json.Unmarshal(msg.Body, &submission); err != nil {
		log.Printf("Failed to unmarshal message: %v", err)
		msg.Nack(false, false)
		return
	}

	if err := handler(&submission); err != nil {
		log.Printf("Handler error for submission %s: %v", submission.SubmissionId, err)
		msg.Nack(false, true)
		return
	}

	if err := msg.Ack(false); err != nil {
		log.Printf("Failed to ack message: %v", err)
		return
	}
}
