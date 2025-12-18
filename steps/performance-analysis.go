package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"
)

type IncidentData struct {
	ID       string `json:"id"`
	Service  string `json:"service"`
	Error    string `json:"error"`
	Severity string `json:"severity"`
	Time     string `json:"time"`
}

type PerformanceAnalysis struct {
	PerformanceMetrics   map[string]float64 `json:"performance_metrics"`
	OptimizationSuggestions []string        `json:"optimization_suggestions"`
	EstimatedImpact      string            `json:"estimated_impact"`
	ProcessedAt          string            `json:"processed_at"`
}

func main() {
	// Read input from stdin
	var incident IncidentData
	decoder := json.NewDecoder(os.Stdin)
	if err := decoder.Decode(&incident); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing input: %v\n", err)
		os.Exit(1)
	}

	// Perform high-performance analysis
	analysis := analyzePerformance(incident)

	// Output result as JSON
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(analysis); err != nil {
		fmt.Fprintf(os.Stderr, "Error encoding output: %v\n", err)
		os.Exit(1)
	}
}

func analyzePerformance(incident IncidentData) PerformanceAnalysis {
	metrics := make(map[string]float64)
	suggestions := []string{}

	// Analyze service performance impact
	switch strings.ToLower(incident.Service) {
	case "database":
		metrics["query_latency_increase"] = 45.2
		metrics["connection_pool_utilization"] = 92.1
		suggestions = append(suggestions,
			"Consider connection pool scaling",
			"Implement query optimization",
			"Add database read replicas")
	case "api-gateway":
		metrics["request_queue_depth"] = 234.0
		metrics["error_rate_percentage"] = 12.5
		suggestions = append(suggestions,
			"Scale API gateway instances",
			"Implement rate limiting",
			"Add circuit breaker pattern")
	case "auth":
		metrics["authentication_failures"] = 89.7
		metrics["token_validation_time"] = 2.3
		suggestions = append(suggestions,
			"Check token service health",
			"Implement token caching",
			"Add authentication redundancy")
	default:
		metrics["general_load_increase"] = 25.0
		suggestions = append(suggestions,
			"Monitor system resources",
			"Scale affected service")
	}

	// Determine impact level
	impact := "Low"
	maxMetric := 0.0
	for _, value := range metrics {
		if value > maxMetric {
			maxMetric = value
		}
	}

	if maxMetric > 80 {
		impact = "High"
	} else if maxMetric > 50 {
		impact = "Medium"
	}

	return PerformanceAnalysis{
		PerformanceMetrics:   metrics,
		OptimizationSuggestions: suggestions,
		EstimatedImpact:      impact,
		ProcessedAt:          time.Now().Format(time.RFC3339),
	}
}