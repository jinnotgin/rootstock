package app

import (
	"log"
	"net/http"

	"rootstock/backend/config"
	v1 "rootstock/backend/internal/controller/restapi/v1"
	"rootstock/backend/internal/platform"
	"rootstock/backend/internal/repo/sqlite"
	"rootstock/backend/internal/usecase"
)

func Run() error {
	cfg := config.Load()
	repo, err := sqlite.Open(cfg.DatabasePath)
	if err != nil {
		return err
	}
	defer repo.Close()

	ids := platform.IDGenerator{}
	clock := platform.Clock{}
	auth := usecase.NewAuthUseCase(repo, ids, clock)
	catalog := usecase.NewCatalogUseCase(repo, ids, clock)
	sessions := v1.NewSessionManager(cfg.JWTSecret, cfg.CookieName)
	handler := v1.NewHandler(auth, catalog, sessions)

	log.Printf("listening on %s", cfg.Address)
	return http.ListenAndServe(cfg.Address, handler.Router())
}
