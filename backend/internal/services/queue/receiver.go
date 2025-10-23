package queue

import (
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

func Receive() error {
	conn, err := amqp091.Dial("amqp://be-dev-services.eksaq.in")

	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()

	if err != nil {
		return fmt.Errorf("failed to open a channel %v", err)
	}

	q, err := ch.QueueDeclare(
		"hello",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return fmt.Errorf("failed to declare a queue %v", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return fmt.Errorf("failed to register a consumer %v", err)
	}

	for msg := range msgs {
		log.Print(string(msg.Body))
		msg.Ack(true)
	}

	return nil
}
