package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func main() {
	app := pocketbase.New()

	// Set the data directory to PocketBase's data location
	dataDir := os.Getenv("PB_DATA_DIR")
	if dataDir == "" {
		dataDir = "./pb_data"
	}
	app.DataDir(dataDir)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		log.Println("Creating collections...")

		// Create cf_users collection
		cfUsers := core.NewBaseCollection("cf_users")
		cfUsers.ListRule = types.Pointer("@request.auth.id != ''")
		cfUsers.ViewRule = types.Pointer("@request.auth.id != ''")

		cfUsers.Fields.Add(&core.EmailField{
			Name:       "email",
			Required:   true,
			Presentable: true,
		})
		cfUsers.Fields.Add(&core.TextField{
			Name:        "name",
			Required:    true,
			Presentable: true,
			Min:         1,
			Max:         255,
		})
		cfUsers.Fields.Add(&core.TextField{
			Name:     "tenant_id",
			Required: true,
		})
		cfUsers.Fields.Add(&core.TextField{
			Name:     "product_id",
			Required: true,
		})
		cfUsers.Fields.Add(&core.SelectField{
			Name:      "role",
			Required:  true,
			MaxSelect: 1,
			Values:    []string{"user", "tenant_admin", "super_admin"},
		})
		cfUsers.Fields.Add(&core.SelectField{
			Name:      "status",
			Required:  true,
			MaxSelect: 1,
			Values:    []string{"pending", "active", "suspended"},
		})
		cfUsers.Fields.Add(&core.NumberField{
			Name:      "budget_limit",
			Required:  false,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		cfUsers.Fields.Add(&core.NumberField{
			Name:      "budget_used",
			Required:  false,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		cfUsers.Fields.Add(&core.TextField{
			Name:     "api_key",
			Required: false,
		})
		cfUsers.Fields.Add(&core.DateField{
			Name:     "last_login",
			Required: false,
		})
		cfUsers.Fields.Add(&core.AutodateField{
			Name:     "created",
			System:   true,
			OnCreate: true,
		})
		cfUsers.Fields.Add(&core.AutodateField{
			Name:     "updated",
			System:   true,
			OnCreate: true,
			OnUpdate: true,
		})

		cfUsers.AddIndex("idx_cf_users_email", true, "email", "")
		cfUsers.AddIndex("idx_cf_users_tenant", false, "tenant_id", "")

		if err := app.Save(cfUsers); err != nil {
			log.Printf("Failed to create cf_users: %v", err)
		} else {
			log.Println("✅ cf_users collection created")
		}

		// Create usage_logs collection
		usageLogs := core.NewBaseCollection("usage_logs")
		usageLogs.ListRule = types.Pointer("@request.auth.id != ''")
		usageLogs.ViewRule = types.Pointer("@request.auth.id != ''")

		usageLogs.Fields.Add(&core.TextField{
			Name:     "tenant_id",
			Required: true,
		})
		usageLogs.Fields.Add(&core.TextField{
			Name:     "user_id",
			Required: true,
		})
		usageLogs.Fields.Add(&core.TextField{
			Name:     "model",
			Required: true,
			Max:      255,
		})
		usageLogs.Fields.Add(&core.NumberField{
			Name:      "input_tokens",
			Required:  true,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		usageLogs.Fields.Add(&core.NumberField{
			Name:      "output_tokens",
			Required:  true,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		usageLogs.Fields.Add(&core.NumberField{
			Name:      "total_tokens",
			Required:  true,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		usageLogs.Fields.Add(&core.NumberField{
			Name:      "cost",
			Required:  true,
			Min:       types.Pointer(0.0),
			NoDecimal: false,
		})
		usageLogs.Fields.Add(&core.TextField{
			Name:     "request_id",
			Required: false,
		})
		usageLogs.Fields.Add(&core.JSONField{
			Name:     "metadata",
			Required: false,
		})
		usageLogs.Fields.Add(&core.AutodateField{
			Name:     "created",
			System:   true,
			OnCreate: true,
		})
		usageLogs.Fields.Add(&core.AutodateField{
			Name:     "updated",
			System:   true,
			OnCreate: true,
			OnUpdate: true,
		})

		usageLogs.AddIndex("idx_usage_logs_tenant", false, "tenant_id", "")
		usageLogs.AddIndex("idx_usage_logs_user", false, "user_id", "")
		usageLogs.AddIndex("idx_usage_logs_created", false, "created", "")

		if err := app.Save(usageLogs); err != nil {
			log.Printf("Failed to create usage_logs: %v", err)
		} else {
			log.Println("✅ usage_logs collection created")
		}

		log.Println("🎉 Collections setup complete!")
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

