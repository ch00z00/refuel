package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	// "gorm.io/driver/mysql" // DB接続時にコメント解除
	// "gorm.io/gorm"         // DB接続時にコメント解除
)

// リクエストバリデーション用のサンプル構造体
type CreateUserInput struct {
	Username string `json:"username" binding:"required,min=3,max=30"`
	Email    string `json:"email" binding:"required,email"`
}

func main() {
	// データベース接続 (後で設定)
	// dsn := "user:pass@tcp(db:3306)/refuel_db?charset=utf8mb4&parseTime=True&loc=Local"
	// _, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// if err != nil {
	// 	log.Fatalf("Failed to connect to database: %v", err)
	// }
	// log.Println("Database connected")

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong from backend"})
	})

	r.POST("/users", func(c *gin.Context) {
		var input CreateUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User created (simulated)", "user": input})
	})

	log.Println("Backend server starting on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}