package database

import (
	"fmt"
	"log"
	"os"

	"invoice-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Database connected successfully.")

	// Auto Migration
	log.Println("Running Auto Migration...")
	err = DB.AutoMigrate(&models.Item{}, &models.Invoice{}, &models.InvoiceDetail{})
	if err != nil {
		log.Fatal("Migration failed. \n", err)
	}

	// Automated Seeding
	SeedItems(DB)
}

func SeedItems(db *gorm.DB) {
	var count int64
	db.Model(&models.Item{}).Count(&count)

	if count == 0 {
		log.Println("Seeding dummy master items...")
		items := []models.Item{
			{Code: "BRG-001", Name: "Semen Portland 50kg", Price: 65000},
			{Code: "BRG-002", Name: "Besi Beton 10mm", Price: 85000},
			{Code: "BRG-003", Name: "Bata Merah (1000 pcs)", Price: 750000},
			{Code: "BRG-004", Name: "Cat Tembok 25kg", Price: 150000},
			{Code: "BRG-005", Name: "Keramik 40x40 (Dus)", Price: 60000},
		}

		for _, item := range items {
			db.Create(&item)
		}
		log.Println("Seeding completed.")
	} else {
		log.Println("Items already seeded.")
	}
}
