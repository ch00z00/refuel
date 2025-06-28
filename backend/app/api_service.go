package app

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"

	refuelapi "refuel/backend/generated/go"
	"refuel/backend/models"
)

// Servicer は、生成されたすべてのAPIサービスインターフェースを埋め込んだ複合インターフェースです。
// これにより、APIServiceがすべてのAPIエンドポイントを処理できるようになります。
type Servicer interface {
	refuelapi.ActionsAPIServicer
	refuelapi.BadgesAPIServicer
	refuelapi.ComplexesAPIServicer
	refuelapi.GoalsAPIServicer
	refuelapi.HealthAPIServicer
	refuelapi.UserBadgesAPIServicer
}

// APIService は、Servicerインターフェースを実装します。
type APIService struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

// NewAPIService creates a new instance of APIService.
func NewAPIService(db *gorm.DB, validate *validator.Validate) Servicer {
	return &APIService{
		DB:       db,
		Validate: validate,
	}
}

// GetUserIDFromContext extracts the user ID from the Gin context.
func GetUserIDFromContext(ctx context.Context) (string, *refuelapi.ImplResponse) {
	ginCtx, ok := ctx.Value(refuelapi.ContextGinContext).(*gin.Context)
	if !ok {
		return "", &refuelapi.ImplResponse{
			Code: http.StatusInternalServerError,
			Body: NewErrorResponse(http.StatusInternalServerError, "Internal server error: Gin context not found"),
		}
	}
	userID, exists := ginCtx.Get("userID")
	if !exists {
		return "", &refuelapi.ImplResponse{
			Code: http.StatusUnauthorized,
			Body: NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"),
		}
	}
	return userID.(string), nil
}

// --- API Service Implementations ---

// CreateAction - 新しい行動を記録
func (s *APIService) CreateAction(ctx context.Context, actionInput refuelapi.ActionInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    // Validate input
    if err := s.Validate.Struct(actionInput); err != nil {
        return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error())}
    }

    // Check if the referenced goal exists and belongs to the user
    var goal models.Goal
    if err := s.DB.Where("id = ? AND user_id = ?", actionInput.GoalId, userID).First(&goal).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Referenced goal not found or does not belong to user")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Error checking goal: "+err.Error())}
    }

    var completedAtParsed *time.Time
    if actionInput.CompletedAt != nil {
        t, err := time.Parse(time.RFC3339, *actionInput.CompletedAt)
        if err != nil {
            return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Invalid completed_at format. Use ISO8601 (RFC3339).")}
        }
        completedAtParsed = &t
    }

    // ... (RecurrencePatternの処理) ...

    action := models.Action{
        UserID:      userID,
        GoalID:      uint(actionInput.GoalId),
        Content:     actionInput.Content,
        CompletedAt: completedAtParsed,
    }

    // Handle Gains
    for _, gainInput := range actionInput.Gains {
        action.Gains = append(action.Gains, models.Gain{
            Type:        string(gainInput.Type),
            Description: gainInput.Description,
        })
    }

    // Handle Losses
    for _, lossInput := range actionInput.Losses {
        action.Losses = append(action.Losses, models.Loss{
            Type:        string(lossInput.Type),
            Description: lossInput.Description,
        })
    }

    if result := s.DB.Create(&action); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to create action: "+result.Error.Error())}
    }

    // DBモデルからAPIモデルへのマッピング
    resAction := refuelapi.Action{
        Id:          int64(action.ID),
        UserId:      action.UserID,
        GoalId:      int64(action.GoalID),
        Content:     action.Content,
        CompletedAt: action.CompletedAt,
        CreatedAt:   &action.CreatedAt,
        UpdatedAt:   &action.UpdatedAt,
        // ... Gains, Losses, RecurrencePatternのマッピングも必要
    }

    return refuelapi.ImplResponse{Code: http.StatusCreated, Body: resAction}
}

// DeleteAction - 既存の行動を削除
func (s *APIService) DeleteAction(ctx context.Context, actionId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if result := s.DB.Where("id = ? AND user_id = ?", actionId, userID).Delete(&models.Action{}); result.Error != nil || result.RowsAffected == 0 {
        return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Action not found or already deleted")}
    }
    return refuelapi.ImplResponse{Code: http.StatusNoContent}
}

// GetActions - 指定された目標IDに紐づく行動の一覧を取得
func (s *APIService) GetActions(ctx context.Context, goalId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    // Ensure the goal belongs to the user to prevent fetching actions for other users' goals
    var goal models.Goal
    if err := s.DB.Where("id = ? AND user_id = ?", goalId, userID).First(&goal).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Goal not found or does not belong to user")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Error verifying goal: "+err.Error())}
    }

    var actions []models.Action
    if result := s.DB.Where("goal_id = ? AND user_id = ?", goalId, userID).Order("created_at DESC").Find(&actions); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch actions: "+result.Error.Error())}
    }

    if actions == nil {
        actions = []models.Action{}
    }

    // Map internal Action models to generated refuelapi.Action models
    resActions := make([]refuelapi.Action, len(actions))
    for i, action := range actions {
        resActions[i] = refuelapi.Action{
            Id:          int64(action.ID),
            UserId:      action.UserID,
            GoalId:      int64(action.GoalID),
            Content:     action.Content,
            CompletedAt: action.CompletedAt,
            CreatedAt:   &action.CreatedAt,
            UpdatedAt:   &action.UpdatedAt,
            // RecurrencePattern: mapRecurrencePattern(action.RecurrencePattern),
            // Gains: mapGains(action.Gains),
            // Losses: mapLosses(action.Losses),
        }
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resActions}
}

// UpdateAction - 既存の行動情報を更新
func (s *APIService) UpdateAction(ctx context.Context, actionId int64, actionUpdateInput refuelapi.ActionUpdateInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    var action models.Action
    if err := s.DB.Where("id = ? AND user_id = ?", actionId, userID).First(&action).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Action not found")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch action: "+err.Error())}
    }

    // Update fields if provided
    if actionUpdateInput.Content != nil {
        action.Content = *actionUpdateInput.Content
    }
    if actionUpdateInput.CompletedAt != nil {
        t, err := time.Parse(time.RFC3339, *actionUpdateInput.CompletedAt)
        if err != nil {
            return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Invalid completed_at format. Use ISO8601 (RFC3339).")}
        }
        action.CompletedAt = &t
    } else {
        // If completed_at is explicitly null in input, set to null
        // This depends on how ActionUpdateInput is generated.
        // If nullable is true, it might be a pointer.
        // For now, assuming if it's not provided, we don't change it.
        // If client sends "completed_at": null, you need to handle it.
    }

    if result := s.DB.Save(&action); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to update action: "+result.Error.Error())}
    }

    // Map internal Action model to generated refuelapi.Action model for response
    resAction := refuelapi.Action{
        Id:          int64(action.ID),
        UserId:      action.UserID,
        GoalId:      int64(action.GoalID),
        Content:     action.Content,
        CompletedAt: action.CompletedAt,
        CreatedAt:   &action.CreatedAt,
        UpdatedAt:   &action.UpdatedAt,
        // RecurrencePattern: mapRecurrencePattern(action.RecurrencePattern),
        // Gains: mapGains(action.Gains),
        // Losses: mapLosses(action.Losses),
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resAction}
}

// GetBadges - 利用可能なバッジの一覧を取得
func (s *APIService) GetBadges(ctx context.Context) (refuelapi.ImplResponse) {
	// TODO - implement GetBadges
	return refuelapi.ImplResponse{Code: http.StatusNotImplemented}
}

// GetUserBadges - 認証ユーザーが獲得したバッジの一覧を取得
func (s *APIService) GetUserBadges(ctx context.Context) (refuelapi.ImplResponse) {
	// TODO - implement GetUserBadges
	return refuelapi.ImplResponse{Code: http.StatusNotImplemented}
}

// GetComplexes - 登録されているコンプレックスの一覧を取得
func (s *APIService) GetComplexes(ctx context.Context) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    var complexes []models.Complex
    if result := s.DB.Where("user_id = ?", userID).Find(&complexes); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch complexes: "+result.Error.Error())}
    }

    if complexes == nil {
        complexes = []models.Complex{}
    }

    // Map internal Complex models to generated refuelapi.Complex models
    resComplexes := make([]refuelapi.Complex, len(complexes))
    for i, c := range complexes {
        resComplexes[i] = refuelapi.Complex{
            Id:        int64(c.ID),
            UserId:    c.UserID,
            Content:   c.Content,
            Category:  c.Category,
            CreatedAt: &c.CreatedAt,
            UpdatedAt: &c.UpdatedAt,
            // Goals: mapGoals(c.Goals), // If goals are preloaded
        }
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resComplexes}
}

// CreateComplex - 新しいコンプレックスを登録
func (s *APIService) CreateComplex(ctx context.Context, complexInput refuelapi.ComplexInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if err := s.Validate.Struct(complexInput); err != nil {
        return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error())}
    }

    // Start a database transaction
    tx := s.DB.Begin()
    if tx.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to start transaction: "+tx.Error.Error())}
    }

	complex := models.Complex{
		UserID:   userID,
        Content:  complexInput.Content,
        Category: complexInput.Category,
        // TriggerEpisode: complexInput.TriggerEpisode, // New field
    }

    if result := tx.Create(&complex); result.Error != nil {
        tx.Rollback()
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to create complex: "+result.Error.Error())}
    }

    // Commit the transaction
    if err := tx.Commit().Error; err != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to commit transaction: "+err.Error())}
    }

    // Reload the complex with its goals to return the complete entity if needed
    // s.DB.Preload("Goals").First(&complex, complex.ID)

    resComplex := refuelapi.Complex{
        Id:        int64(complex.ID),
        UserId:    complex.UserID,
        Content:   complex.Content,
        Category:  complex.Category,
        CreatedAt: &complex.CreatedAt,
        UpdatedAt: &complex.UpdatedAt,
    }

    return refuelapi.ImplResponse{Code: http.StatusCreated, Body: resComplex}
}

// DeleteComplex - 既存のコンプレックスを削除
func (s *APIService) DeleteComplex(ctx context.Context, complexId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if result := s.DB.Where("id = ? AND user_id = ?", complexId, userID).Delete(&models.Complex{}); result.Error != nil || result.RowsAffected == 0 {
        return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Complex not found or already deleted")}
    }
    return refuelapi.ImplResponse{Code: http.StatusNoContent}
}

// GetComplex - 指定されたIDのコンプレックス情報を取得します。
func (s *APIService) GetComplex(ctx context.Context, complexId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    var complex models.Complex
    if result := s.DB.Where("id = ? AND user_id = ?", complexId, userID).First(&complex); result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Complex not found")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch complex: "+result.Error.Error())}
    }

    // Preload Goals if needed for the response
    s.DB.Preload("Goals").First(&complex, complex.ID)

    resComplex := refuelapi.Complex{
        Id:        int64(complex.ID),
        UserId:    complex.UserID,
        Content:   complex.Content,
        Category:  complex.Category,
        CreatedAt: &complex.CreatedAt,
        UpdatedAt: &complex.UpdatedAt,
        // Goals: mapGoals(complex.Goals), // Map internal Goal to generated refuelapi.Goal
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resComplex}
}

// UpdateComplex - 既存のコンプレックス情報を更新します。
func (s *APIService) UpdateComplex(ctx context.Context, complexId int64, complexInput refuelapi.ComplexInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if err := s.Validate.Struct(complexInput); err != nil {
        return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error())}
    }

    var existingComplex models.Complex
    if err := s.DB.Where("id = ? AND user_id = ?", complexId, userID).First(&existingComplex).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Complex not found to update")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to find complex to update: "+err.Error())}
    }

    // Update Complex fields
    existingComplex.Content = complexInput.Content
    existingComplex.Category = complexInput.Category
    // existingComplex.TriggerEpisode = complexInput.TriggerEpisode // New field

    if err := s.DB.Save(&existingComplex).Error; err != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to update complex: "+err.Error())}
    }

    // Reload the complex with its goals to return the complete entity if needed
    s.DB.Preload("Goals").First(&existingComplex, existingComplex.ID)

    resComplex := refuelapi.Complex{
        Id:        int64(existingComplex.ID),
        UserId:    existingComplex.UserID,
        Content:   existingComplex.Content,
        Category:  existingComplex.Category,
        CreatedAt: &existingComplex.CreatedAt,
        UpdatedAt: &existingComplex.UpdatedAt,
        // Goals: mapGoals(existingComplex.Goals),
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resComplex}
}

// CreateGoal - 新しい目標を登録
func (s *APIService) CreateGoal(ctx context.Context, goalInput refuelapi.GoalInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if err := s.Validate.Struct(goalInput); err != nil {
        return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error())}
    }

    // Check if the referenced complex exists and belongs to the user
    var complex models.Complex
    if err := s.DB.Where("id = ? AND user_id = ?", goalInput.ComplexId, userID).First(&complex).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Referenced complex not found or does not belong to user")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Error checking complex: "+err.Error())}
    }

    goal := models.Goal{
		UserID:    userID,
        ComplexID: uint(goalInput.ComplexId),
        Content:   goalInput.Content,
    }

    if result := s.DB.Create(&goal); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to create goal: "+result.Error.Error())}
    }

    resGoal := refuelapi.Goal{
        Id:        int64(goal.ID),
        UserId:    goal.UserID,
        ComplexId: int64(goal.ComplexID),
        Content:   goal.Content,
        CreatedAt: &goal.CreatedAt,
        UpdatedAt: &goal.UpdatedAt,
    }

    return refuelapi.ImplResponse{Code: http.StatusCreated, Body: resGoal}
}

// DeleteGoal - 既存の目標を削除
func (s *APIService) DeleteGoal(ctx context.Context, goalId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if result := s.DB.Where("id = ? AND user_id = ?", goalId, userID).Delete(&models.Goal{}); result.Error != nil || result.RowsAffected == 0 {
        return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Goal not found or already deleted")}
    }
    return refuelapi.ImplResponse{Code: http.StatusNoContent}
}

// GetGoal - 指定されたIDの目標情報を取得
func (s *APIService) GetGoal(ctx context.Context, goalId int64) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    var goal models.Goal
    if err := s.DB.Where("id = ? AND user_id = ?", goalId, userID).First(&goal).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Goal not found")}
        }
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch goal: "+err.Error())}
    }

    resGoal := refuelapi.Goal{
        Id:        int64(goal.ID),
        UserId:    goal.UserID,
        ComplexId: int64(goal.ComplexID),
        Content:   goal.Content,
        CreatedAt: &goal.CreatedAt,
        UpdatedAt: &goal.UpdatedAt,
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resGoal}
}

// GetGoals - 登録されている目標の一覧を取得
func (s *APIService) GetGoals(ctx context.Context) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    var goals []models.Goal
    if result := s.DB.Where("user_id = ?", userID).Find(&goals); result.Error != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to fetch goals: "+result.Error.Error())}
    }

    if goals == nil {
        goals = []models.Goal{}
    }

    resGoals := make([]refuelapi.Goal, len(goals))
    for i, g := range goals {
        resGoals[i] = refuelapi.Goal{
            Id:        int64(g.ID),
            UserId:    g.UserID,
            ComplexId: int64(g.ComplexID),
            Content:   g.Content,
            CreatedAt: &g.CreatedAt,
            UpdatedAt: &g.UpdatedAt,
        }
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resGoals}
}

// UpdateGoal - 既存の目標情報を更新
func (s *APIService) UpdateGoal(ctx context.Context, goalId int64, goalInput refuelapi.GoalInput) (refuelapi.ImplResponse) {
    userID, resp := GetUserIDFromContext(ctx)
    if resp != nil {
        return *resp
    }

    if err := s.Validate.Struct(goalInput); err != nil {
        return refuelapi.ImplResponse{Code: http.StatusBadRequest, Body: NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error())}
    }

    var goal models.Goal
    if err := s.DB.Where("id = ? AND user_id = ?", goalId, userID).First(&goal).Error; err != nil {
        return refuelapi.ImplResponse{Code: http.StatusNotFound, Body: NewErrorResponse(http.StatusNotFound, "Goal not found to update")}
    }

    goal.Content = goalInput.Content

    if err := s.DB.Save(&goal).Error; err != nil {
        return refuelapi.ImplResponse{Code: http.StatusInternalServerError, Body: NewErrorResponse(http.StatusInternalServerError, "Failed to update goal: "+err.Error())}
    }

    resGoal := refuelapi.Goal{
        Id:        int64(goal.ID),
        UserId:    goal.UserID,
        ComplexId: int64(goal.ComplexID),
        Content:   goal.Content,
        CreatedAt: &goal.CreatedAt,
        UpdatedAt: &goal.UpdatedAt,
    }

    return refuelapi.ImplResponse{Code: http.StatusOK, Body: resGoal}
}

// Ping - サーバーの死活監視
func (s *APIService) Ping(ctx context.Context) (refuelapi.ImplResponse) {
    return refuelapi.ImplResponse{Code: http.StatusOK, Body: map[string]string{"message": "pong"}}
}