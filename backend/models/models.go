package models

import (
	"time"

	"gorm.io/gorm"
)

type Item struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	Code      string  `gorm:"uniqueIndex;not null" json:"code"`
	Name      string  `gorm:"not null" json:"name"`
	Price     float64 `gorm:"type:decimal(10,2);not null" json:"price"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Invoice struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	InvoiceNumber   string          `gorm:"uniqueIndex;not null" json:"invoice_number"`
	SenderName      string          `gorm:"not null" json:"sender_name"`
	SenderAddress   string          `gorm:"type:text;not null" json:"sender_address"`
	ReceiverName    string          `gorm:"not null" json:"receiver_name"`
	ReceiverAddress string          `gorm:"type:text;not null" json:"receiver_address"`
	TotalAmount     float64         `gorm:"type:decimal(15,2);not null" json:"total_amount"`
	CreatedBy       uint            `gorm:"not null" json:"created_by"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"-"`
	Details         []InvoiceDetail `gorm:"foreignKey:InvoiceID" json:"details"`
}

type InvoiceDetail struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	InvoiceID uint    `gorm:"not null" json:"invoice_id"`
	ItemID    uint    `gorm:"not null" json:"item_id"`
	Item      Item    `gorm:"foreignKey:ItemID" json:"item,omitempty"`
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"type:decimal(10,2);not null" json:"price"` // Snapshot price
	Subtotal  float64 `gorm:"type:decimal(15,2);not null" json:"subtotal"`
}
