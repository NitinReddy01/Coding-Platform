package handlers

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/models"
	"context"
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
	var problem models.Problem
	query := "SELECT p.id,p.title,p.description,p.difficulty,p.accepted,p.submissions,p.constraints FROM problems p,test_cases t WHERE p.status = $1"
	row := db.Pool.QueryRow(context.Background(), query, title)
	err := row.Scan(&problem.ID)
	if err != nil {
		fmt.Print(err)
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

	query := "INSERT INTO problems(title,description,difficulty,author_id,status,reviewed_by, reviewed_at, time_limit, memory_limit, constraints) VALUES($1,$2, $3,$4,$5,$6,$7,$8,$9,$10)"

	_, queryErr := db.Pool.Exec(context.Background(), query, problemData.Title, problemData.Description, problemData.Difficulty, problemData.AuthorID, problemData.Status, problemData.TimeLimit, problemData.MemoryLimit, problemData.Constraints)

	if queryErr != nil {
		fmt.Print(queryErr)
		lib.JSONError(w, http.StatusInternalServerError, "Internal Error")
		return
	}

	lib.JSON(w, http.StatusCreated, map[string]any{
		"message": "Problem Added",
	})
}
