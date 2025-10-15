package handlers

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/models"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func GetLanguages(w http.ResponseWriter, r *http.Request) {
	lib.JSON(w, http.StatusOK, lib.Languages)
}

func GetProblem(w http.ResponseWriter, r *http.Request) {

	title := strings.TrimSpace(r.PathValue("title"))
	if title == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Problem Id")
		return
	}

	query := r.URL.Query()
	mode := query.Get("mode")

	if mode == "" || strings.TrimSpace(mode) == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Mode")
		return
	}
	problemMode := models.ProblemMode(mode)

	if !problemMode.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Mode")
		return
	}
	ctx := r.Context()

	if problemMode == models.Edit {
		problem, err := db.GetProblemForAdmin(ctx, title, false)
		if err != nil {
			lib.JSONError(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		lib.JSON(w, http.StatusOK, map[string]any{
			"problem": problem,
		})
		return
	}

	problem, err := db.GetProblem(ctx, title, false)

	if err != nil {
		lib.JSONError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	lib.JSON(w, http.StatusOK, map[string]any{
		"problem": problem,
	})
}

func AddProblem(w http.ResponseWriter, r *http.Request) {
	var problemData models.ProblemInput
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&problemData)
	if err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Data")
		return
	}
	if !problemData.Difficulty.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid problem difficulty ")
		return
	}
	if problemData.Status != models.Pending {
		lib.JSONError(w, http.StatusBadRequest, "Invalid status")
		return
	}
	ctx := r.Context()
	exists, err := db.ProblemExists(ctx, problemData.Title)

	if err != nil {
		lib.JSONError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	if exists {
		lib.JSONError(w, http.StatusConflict, fmt.Sprintf("Problem %s already exists", problemData.Title))
		return
	}

	err = db.AddProblem(ctx, problemData)

	if err != nil {
		lib.JSONError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	lib.JSON(w, http.StatusCreated, map[string]any{
		"message": "Problem Added",
	})
}
