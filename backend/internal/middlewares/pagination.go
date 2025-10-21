package middlewares

import (
	"context"
	"net/http"
	"strconv"
)

type paginationKey string

const paginateContextKey paginationKey = "pagination"

type Pagination struct {
	Offset uint16 // might change the offset type when scale is more
	Limit  uint8
}

func Paginate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		pageStr := r.URL.Query().Get("page")
		limitStr := r.URL.Query().Get("limit")

		page := uint16(1)
		limit := uint8(10)

		if p, err := strconv.ParseUint(pageStr, 10, 16); err == nil && p > 0 {
			page = uint16(p)
		}

		if l, err := strconv.ParseUint(limitStr, 10, 8); err == nil && l > 0 {
			limit = uint8(l)
		}

		offset := (page - 1) * uint16(limit)

		pagination := &Pagination{
			Limit:  limit,
			Offset: offset,
		}

		ctx := context.WithValue(r.Context(), paginateContextKey, pagination)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetPagination(r *http.Request) *Pagination {
	if v := r.Context().Value(paginateContextKey); v != nil {
		if p, ok := v.(*Pagination); ok {
			return p
		}
	}

	return &Pagination{Offset: 0, Limit: 10}
}
