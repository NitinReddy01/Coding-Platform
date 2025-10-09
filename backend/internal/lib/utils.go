package lib

import (
	"encoding/json"
	"net/http"
)

func JSON(res http.ResponseWriter, status int, data interface{}) {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(status)

	if data == nil {
		return
	}

	err := json.NewEncoder(res).Encode(data)
	if err != nil {
		JSONError(res, http.StatusInternalServerError, "Something went wrong")
	}
}

func JSONError(res http.ResponseWriter, status int, message string) {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(status)

	json.NewEncoder(res).Encode(map[string]string{
		"error": message,
	})
}
