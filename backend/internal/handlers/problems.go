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

func GetLanguages(res http.ResponseWriter, req *http.Request) {
	lib.JSON(res, http.StatusOK, lib.Languages)
}

func GetProblem(res http.ResponseWriter, req *http.Request) {
	title := strings.TrimSpace(req.PathValue("title"))
	fmt.Print(title)
	if title == "" {
		lib.JSONError(res, http.StatusBadRequest, "Invalid Problem Id")
		return
	}
	query := "select * from problems where title =$1"
	row := db.Pool.QueryRow(context.Background(), query, title)
	fmt.Print(row)

}

func AddProblem(res http.ResponseWriter, req *http.Request) {
	var problemData models.ProblemInput
	defer req.Body.Close()
	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&problemData)
	if err != nil {
		lib.JSONError(res, http.StatusBadRequest, "Invalid Data")
		return
	}
	if !problemData.Difficulty.IsValid() {
		lib.JSONError(res, http.StatusBadRequest, "Invalid problem difficulty ")
		return
	}
	if problemData.Status != models.Pending {
		lib.JSONError(res, http.StatusBadRequest, "Invalid status")
		return
	}

	query := "INSERT INTO problems(title,description,difficulty,author_id,status,reviewed_by, reviewed_at, time_limit, memory_limit, constraints) VALUES($1,$2, $3,$4,$5,$6,$7,$8,$9,$10)"

	_, queryErr := db.Pool.Exec(context.Background(), query, problemData.Title, problemData.Description, problemData.Difficulty, problemData.AuthorID, problemData.Status, problemData.TimeLimit, problemData.MemoryLimit, problemData.Constraints)

	if queryErr != nil {
		fmt.Print(queryErr)
		lib.JSONError(res, http.StatusInternalServerError, "Internal Error")
		return
	}

	lib.JSON(res, http.StatusCreated, "Problem Added")
}
