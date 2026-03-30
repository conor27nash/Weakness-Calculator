package backend_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/conor27nash/weakness-calculator/backend"
)

func TestHandleDefend_ValidSingleType(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend?type1=fire", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var results []backend.MatchupResult
	if err := json.NewDecoder(rec.Body).Decode(&results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 18 {
		t.Errorf("expected 18 results, got %d", len(results))
	}
}

func TestHandleDefend_ValidDualType(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend?type1=fire&type2=grass", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var results []backend.MatchupResult
	if err := json.NewDecoder(rec.Body).Decode(&results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 18 {
		t.Errorf("expected 18 results, got %d", len(results))
	}
}

func TestHandleDefend_MissingType1(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func TestHandleDefend_InvalidType1(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend?type1=banana", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func TestHandleDefend_InvalidType2(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend?type1=fire&type2=banana", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func TestHandleDefend_CaseInsensitive(t *testing.T) {
	req := httptest.NewRequest("GET", "/defend?type1=FIRE&type2=Grass", nil)
	rec := httptest.NewRecorder()

	backend.HandleDefend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var results []backend.MatchupResult
	if err := json.NewDecoder(rec.Body).Decode(&results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 18 {
		t.Errorf("expected 18 results, got %d", len(results))
	}
}

func TestHandleAttack_Valid(t *testing.T) {
	req := httptest.NewRequest("GET", "/attack?type=fire", nil)
	rec := httptest.NewRecorder()

	backend.HandleAttack(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var results []backend.MatchupResult
	if err := json.NewDecoder(rec.Body).Decode(&results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 18 {
		t.Errorf("expected 18 results, got %d", len(results))
	}
}

func TestHandleAttack_MissingType(t *testing.T) {
	req := httptest.NewRequest("GET", "/attack", nil)
	rec := httptest.NewRecorder()

	backend.HandleAttack(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func TestHandleAttack_InvalidType(t *testing.T) {
	req := httptest.NewRequest("GET", "/attack?type=banana", nil)
	rec := httptest.NewRecorder()

	backend.HandleAttack(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func TestHandleAttack_CaseInsensitive(t *testing.T) {
	req := httptest.NewRequest("GET", "/attack?type=FIRE", nil)
	rec := httptest.NewRecorder()

	backend.HandleAttack(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var results []backend.MatchupResult
	if err := json.NewDecoder(rec.Body).Decode(&results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 18 {
		t.Errorf("expected 18 results, got %d", len(results))
	}
}
