package handlers

import (
	"invoice-backend/database"
	"invoice-backend/models"

	"github.com/gofiber/fiber/v2"
)

func SearchItems(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.JSON([]models.Item{})
	}

	var items []models.Item
	// Using ilike for case-insensitive search if desired, or simple like
	database.DB.Where("code ILIKE ? OR name ILIKE ?", "%"+code+"%", "%"+code+"%").Find(&items)

	return c.JSON(items)
}
