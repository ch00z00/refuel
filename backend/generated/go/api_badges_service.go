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

// BadgesAPIService is a service that implements the logic for the BadgesAPIServicer
// This service should implement the business logic for every endpoint for the BadgesAPI API.
// Include any external packages or services that will be required by this service.
type BadgesAPIService struct {
}

// NewBadgesAPIService creates a default api service
func NewBadgesAPIService() *BadgesAPIService {
	return &BadgesAPIService{}
}

// GetBadges - 利用可能なバッジの一覧を取得
func (s *BadgesAPIService) GetBadges(ctx context.Context) (ImplResponse, error) {
	// TODO - update GetBadges with the required logic for this service method.
	// Add api_badges_service.go to the .openapi-generator-ignore to avoid overwriting this service implementation when updating open api generation.

	// TODO: Uncomment the next line to return response Response(200, []Badge{}) or use other options such as http.Ok ...
	// return Response(200, []Badge{}), nil

	// TODO: Uncomment the next line to return response Response(500, Error{}) or use other options such as http.Ok ...
	// return Response(500, Error{}), nil

	return Response(http.StatusNotImplemented, nil), errors.New("GetBadges method not implemented")
}
