package main

import (
	"log"
	"os"

	"invoice-backend/database"
	"invoice-backend/handlers"
	"invoice-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Require DB_HOST etc from docker-compose environment vars
	database.Connect()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	api := app.Group("/api")

	// Auth Route
	api.Post("/login", handlers.Login)

	// Public Item Route (debounced search)
	api.Get("/items", handlers.SearchItems)

	// Protected Invoice Route
	api.Post("/invoices", middleware.Protected(), handlers.SubmitInvoice)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}
