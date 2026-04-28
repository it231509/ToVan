import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { RecipesModule } from './recipes/recipes.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { UsersModule } from './users/users.module';
import { CleaningModule } from './cleaning/cleaning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecipesModule,
    MealPlanModule,
    ShoppingListModule,
    UsersModule,
    CleaningModule
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
