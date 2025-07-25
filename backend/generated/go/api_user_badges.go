// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

/*
 * Re:Fuel API
 *
 * コンプレックスを燃料に変える自己進化アプリ「Re:Fuel」のAPI仕様書です。 MVP（Minimum Viable Product）の機能を対象としています。 
 *
 * API version: v1.0.0
 */

package refuelapi

import (
	"net/http"
	"strings"
)

// UserBadgesAPIController binds http requests to an api service and writes the service results to the http response
type UserBadgesAPIController struct {
	service UserBadgesAPIServicer
	errorHandler ErrorHandler
}

// UserBadgesAPIOption for how the controller is set up.
type UserBadgesAPIOption func(*UserBadgesAPIController)

// WithUserBadgesAPIErrorHandler inject ErrorHandler into controller
func WithUserBadgesAPIErrorHandler(h ErrorHandler) UserBadgesAPIOption {
	return func(c *UserBadgesAPIController) {
		c.errorHandler = h
	}
}

// NewUserBadgesAPIController creates a default api controller
func NewUserBadgesAPIController(s UserBadgesAPIServicer, opts ...UserBadgesAPIOption) *UserBadgesAPIController {
	controller := &UserBadgesAPIController{
		service:      s,
		errorHandler: DefaultErrorHandler,
	}

	for _, opt := range opts {
		opt(controller)
	}

	return controller
}

// Routes returns all the api routes for the UserBadgesAPIController
func (c *UserBadgesAPIController) Routes() Routes {
	return Routes{
		"GetUserBadges": Route{
			strings.ToUpper("Get"),
			"/api/v1/me/badges",
			c.GetUserBadges,
		},
	}
}

// GetUserBadges - 認証ユーザーが獲得したバッジの一覧を取得
func (c *UserBadgesAPIController) GetUserBadges(w http.ResponseWriter, r *http.Request) {
	result, err := c.service.GetUserBadges(r.Context())
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	_ = EncodeJSONResponse(result.Body, &result.Code, w)
}
