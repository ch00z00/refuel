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
	"context"
	"net/http"
	"errors"
)

// UserBadgesAPIService is a service that implements the logic for the UserBadgesAPIServicer
// This service should implement the business logic for every endpoint for the UserBadgesAPI API.
// Include any external packages or services that will be required by this service.
type UserBadgesAPIService struct {
}

// NewUserBadgesAPIService creates a default api service
func NewUserBadgesAPIService() *UserBadgesAPIService {
	return &UserBadgesAPIService{}
}

// GetUserBadges - 認証ユーザーが獲得したバッジの一覧を取得
func (s *UserBadgesAPIService) GetUserBadges(ctx context.Context) (ImplResponse, error) {
	// TODO - update GetUserBadges with the required logic for this service method.
	// Add api_user_badges_service.go to the .openapi-generator-ignore to avoid overwriting this service implementation when updating open api generation.

	// TODO: Uncomment the next line to return response Response(200, []UserBadge{}) or use other options such as http.Ok ...
	// return Response(200, []UserBadge{}), nil

	// TODO: Uncomment the next line to return response Response(401, Error{}) or use other options such as http.Ok ...
	// return Response(401, Error{}), nil

	return Response(http.StatusNotImplemented, nil), errors.New("GetUserBadges method not implemented")
}
