-- lib/db/migrations/0009_add_user_profiles.sql として作成
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "gender" varchar(10),
    "occupation" varchar(20),
    "age" integer,
    "height" integer,
    "weight" numeric(5,2),
    "fitness_level" varchar(20),
    "goals" text,
    "training_frequency" integer,
    "preferred_training_time" varchar(20),
    "dietary_restrictions" text,
    "daily_calories" integer,
    "protein_goal" numeric(5,2),
    "current_habits" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;