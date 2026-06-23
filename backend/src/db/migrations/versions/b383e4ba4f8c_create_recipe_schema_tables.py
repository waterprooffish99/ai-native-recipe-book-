"""create_recipe_schema_tables

Revision ID: b383e4ba4f8c
Revises: 005
Create Date: 2025-12-25 11:37:25.356426

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid


revision = 'b383e4ba4f8c'
down_revision = '005'
branch_labels = None
depends_on = None

def upgrade():
    # T009: Create Recipe table
    op.create_table(
        'recipes',
        sa.Column('recipe_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('origin_country', sa.String(100), nullable=False),
        sa.Column('difficulty', sa.String(50), nullable=False),
        sa.Column('prep_time', sa.Integer, nullable=True),
        sa.Column('cook_time', sa.Integer, nullable=True),
        sa.Column('total_time', sa.Integer, nullable=True),
        sa.Column('servings', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
    )

    # T010: Create RecipeTranslation table
    op.create_table(
        'recipe_translations',
        sa.Column('translation_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('recipe_id', UUID(as_uuid=True), sa.ForeignKey('recipes.recipe_id', ondelete='CASCADE'), nullable=False),
        sa.Column('language_code', sa.String(10), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('kitchen_guard', sa.Text, nullable=True),
        sa.Column('ingredients', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('idx_recipe_translations_recipe_lang', 'recipe_translations', ['recipe_id', 'language_code'], unique=True)

    # T011: Create RecipeStep table
    op.create_table(
        'recipe_steps',
        sa.Column('step_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('recipe_id', UUID(as_uuid=True), sa.ForeignKey('recipes.recipe_id', ondelete='CASCADE'), nullable=False),
        sa.Column('step_number', sa.Integer, nullable=False),
        sa.Column('instruction', sa.Text, nullable=False),
        sa.Column('audio_clip_url', sa.String(500), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_recipe_steps_recipe_number', 'recipe_steps', ['recipe_id', 'step_number'], unique=True)

    # T012: Create RecipeStepTranslation table
    op.create_table(
        'recipe_step_translations',
        sa.Column('step_translation_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('step_id', UUID(as_uuid=True), sa.ForeignKey('recipe_steps.step_id', ondelete='CASCADE'), nullable=False),
        sa.Column('language_code', sa.String(10), nullable=False),
        sa.Column('instruction', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_step_translations_step_lang', 'recipe_step_translations', ['step_id', 'language_code'], unique=True)

    # T013: Create UserBackground table
    op.create_table(
        'user_backgrounds',
        sa.Column('user_id', UUID(as_uuid=True), primary_key=True),
        sa.Column('software_background', sa.String(50), nullable=True),
        sa.Column('hardware_background', sa.String(50), nullable=True),
        sa.Column('cooking_level', sa.String(50), nullable=True),
        sa.Column('dietary_restrictions', sa.Text, nullable=True),
        sa.Column('preferred_language', sa.String(10), nullable=True),
        sa.Column('preferred_voice', sa.String(100), nullable=True),
    )

    # T014: Create MetaphorMapping table
    op.create_table(
        'metaphor_mappings',
        sa.Column('mapping_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('background_type', sa.String(50), nullable=False),
        sa.Column('background_level', sa.String(50), nullable=False),
        sa.Column('context', sa.String(100), nullable=False),
        sa.Column('metaphor_template', sa.Text, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
    )
    op.create_index('idx_metaphor_mappings_lookup', 'metaphor_mappings', ['background_type', 'background_level', 'context'])

def downgrade():
    # Drop tables in reverse order
    op.drop_table('metaphor_mappings')
    op.drop_table('user_backgrounds')
    op.drop_table('recipe_step_translations')
    op.drop_table('recipe_steps')
    op.drop_table('recipe_translations')
    op.drop_table('recipes')
