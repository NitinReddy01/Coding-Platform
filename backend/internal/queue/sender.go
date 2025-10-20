package queue

import (
	"context"
	"fmt"
	"log"

	"github.com/rabbitmq/amqp091-go"
)

func Sender(ctx context.Context) error {
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

	body := "hello world"

	err = ch.PublishWithContext(ctx,
		"",
		q.Name,
		false,
		false,
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		})

	if err != nil {
		return fmt.Errorf("failed to publish message %v", err)
	}
	log.Printf(" [x] Sent %s\n", body)
	return nil
}
