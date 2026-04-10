package handlers

import (
	"fmt"
	"time"

	"invoice-backend/database"
	"invoice-backend/models"

	"github.com/gofiber/fiber/v2"
)

type InvoiceDetailRequest struct {
	ItemID   uint `json:"item_id"`
	Quantity int  `json:"quantity"`
}

type SubmitInvoiceRequest struct {
	SenderName      string                 `json:"sender_name"`
	SenderAddress   string                 `json:"sender_address"`
	ReceiverName    string                 `json:"receiver_name"`
	ReceiverAddress string                 `json:"receiver_address"`
	Details         []InvoiceDetailRequest `json:"details"`
}

func SubmitInvoice(c *fiber.Ctx) error {
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized user context"})
	}
	userID := uint(userIDFloat)

	var req SubmitInvoiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if len(req.Details) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invoice must have at least one item"})
	}

	tx := database.DB.Begin()

	invoiceNumber := fmt.Sprintf("INV-%d-%v", userID, time.Now().Unix())
	
	invoice := models.Invoice{
		InvoiceNumber:   invoiceNumber,
		SenderName:      req.SenderName,
		SenderAddress:   req.SenderAddress,
		ReceiverName:    req.ReceiverName,
		ReceiverAddress: req.ReceiverAddress,
		CreatedBy:       userID,
		CreatedAt:       time.Now(),
		TotalAmount:     0, // Will compute via Zero-Trust
	}

	if err := tx.Create(&invoice).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create invoice header"})
	}

	var grandTotal float64

	for _, reqDetail := range req.Details {
		var item models.Item
		if err := tx.First(&item, reqDetail.ItemID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": fmt.Sprintf("Item with ID %d not found", reqDetail.ItemID)})
		}

		subtotal := item.Price * float64(reqDetail.Quantity)
		grandTotal += subtotal

		detail := models.InvoiceDetail{
			InvoiceID: invoice.ID,
			ItemID:    item.ID,
			Quantity:  reqDetail.Quantity,
			Price:     item.Price, // Snapshot the database price
			Subtotal:  subtotal,
		}

		if err := tx.Create(&detail).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create invoice detail"})
		}
	}

	// Update the header with the valid calculated GrandTotal
	if err := tx.Model(&invoice).Update("TotalAmount", grandTotal).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update grand total"})
	}

	tx.Commit()

	// Return the completed invoice for the frontend to print/review the real amount
	tx.Preload("Details.Item").First(&invoice, invoice.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Invoice successfully created",
		"data":    invoice,
	})
}
