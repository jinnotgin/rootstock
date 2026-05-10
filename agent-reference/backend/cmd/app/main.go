package main

import (
	"log"

	"rootstock/backend/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
