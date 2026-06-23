"""create_user_recipe_progress_table

Revision ID: 26debdcf7ce8
Revises: 4e6f9a2c3d4e
Create Date: 2026-06-18 22:30:34.028322

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = '26debdcf7ce8'
down_revision = '4e6f9a2c3d4e'
branch_labels = None
depends_on = None

def upgrade():
    # Create user_recipe_progress table
    op.create_table(
        'user_recipe_progress',
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recipe_id', UUID(as_uuid=True), sa.ForeignKey('recipes.recipe_id', ondelete='CASCADE'), nullable=False),
        sa.Column('started_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('current_step', sa.Integer, default=1, nullable=False),
        sa.Column('total_steps', sa.Integer, default=5, nullable=False),
        sa.Column('cook_mode_active', sa.Boolean, default=False, nullable=False),
        sa.Column('last_synced_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('user_id', 'recipe_id')
    )
    op.create_index('idx_progress_user_recipe', 'user_recipe_progress', ['user_id', 'recipe_id'])

    # Create ingredient_checkboxes table
    op.create_table(
        'ingredient_checkboxes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('progress_user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('progress_recipe_id', UUID(as_uuid=True), nullable=False),
        sa.Column('ingredient_id', sa.String(255), nullable=False),
        sa.Column('is_checked', sa.Boolean, default=False, nullable=False),
        sa.Column('checked_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('display_order', sa.Integer, nullable=True),
        sa.ForeignKeyConstraint(['progress_user_id', 'progress_recipe_id'], ['user_recipe_progress.user_id', 'user_recipe_progress.recipe_id'], ondelete='CASCADE'),
    )
    op.create_index('idx_checkboxes_progress', 'ingredient_checkboxes', ['progress_user_id', 'progress_recipe_id'])
    op.create_index('idx_checkboxes_lookup', 'ingredient_checkboxes', ['progress_user_id', 'progress_recipe_id', 'ingredient_id'], unique=True)

    # Create step_progress table
    op.create_table(
        'step_progress',
        sa.Column('progress_user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('progress_recipe_id', UUID(as_uuid=True), nullable=False),
        sa.Column('step_id', UUID(as_uuid=True), sa.ForeignKey('recipe_steps.step_id', ondelete='CASCADE'), nullable=False),
        sa.Column('step_number', sa.Integer, nullable=False),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('started_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('time_spent', sa.Integer, default=0, nullable=False),
        sa.ForeignKeyConstraint(['progress_user_id', 'progress_recipe_id'], ['user_recipe_progress.user_id', 'user_recipe_progress.recipe_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('progress_user_id', 'progress_recipe_id', 'step_id')
    )
    op.create_index('idx_step_progress_lookup', 'step_progress', ['progress_user_id', 'progress_recipe_id', 'step_id'])


def downgrade():
    op.drop_table('step_progress')
    op.drop_table('ingredient_checkboxes')
    op.drop_table('user_recipe_progress')

