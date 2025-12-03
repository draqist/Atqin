package data

import (
	"math"

	"github.com/draqist/iqraa/backend/internal/validator"
)

// Filters contains common pagination and sorting parameters for list requests.
type Filters struct {
	Page         int      `json:"page"`
	PageSize     int      `json:"page_size"`
	Sort         string   `json:"sort"`
	SortSafeList []string // Supported sort fields
}

// Metadata contains pagination metadata for a list response.
type Metadata struct {
	CurrentPage  int `json:"current_page,omitempty"`
	PageSize     int `json:"page_size,omitempty"`
	FirstPage    int `json:"first_page,omitempty"`
	LastPage     int `json:"last_page,omitempty"`
	TotalRecords int `json:"total_records,omitempty"`
}

// calculateMetadata generates pagination metadata based on total records, current page, and page size.
func calculateMetadata(totalRecords, page, pageSize int) Metadata {
	if totalRecords == 0 {
		return Metadata{}
	}

	return Metadata{
		CurrentPage:  page,
		PageSize:     pageSize,
		FirstPage:    1,
		LastPage:     int(math.Ceil(float64(totalRecords) / float64(pageSize))),
		TotalRecords: totalRecords,
	}
}

// Limit returns the page size (limit) for database queries.
func (f Filters) Limit() int {
	return f.PageSize
}

// Offset returns the offset for database queries based on the current page.
func (f Filters) Offset() int {
	return (f.Page - 1) * f.PageSize
}

// ValidateFilters checks if the provided filters are valid.
func ValidateFilters(v *validator.Validator, f Filters) {
	v.Check(f.Page > 0, "page", "must be greater than zero")
	v.Check(f.Page <= 10_000_000, "page", "must be a maximum of 10 million")
	v.Check(f.PageSize > 0, "page_size", "must be greater than zero")
	v.Check(f.PageSize <= 100, "page_size", "must be a maximum of 100")
	v.Check(validator.PermittedValue(f.Sort, f.SortSafeList...), "sort", "invalid sort value")
}