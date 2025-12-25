"""create metaphor mappings

Revision ID: 3d5e8f9a1b2c
Revises: c108a9e62138
Create Date: 2025-12-25 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '3d5e8f9a1b2c'
down_revision = 'c108a9e62138'
branch_labels = None
depends_on = None


def upgrade():
    # Create metaphor_mappings table
    op.create_table(
        'metaphor_mappings',
        sa.Column('mapping_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('background_type', sa.String(50), nullable=False),
        sa.Column('background_level', sa.String(50), nullable=False),
        sa.Column('context', sa.String(100), nullable=False),
        sa.Column('metaphor_template', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('mapping_id'),
        sa.CheckConstraint("background_type IN ('software', 'hardware', 'cooking', 'other')", name='ck_background_type'),
        sa.CheckConstraint("background_level IN ('beginner', 'intermediate', 'expert')", name='ck_background_level'),
        sa.CheckConstraint("context IN ('recipe_explanation', 'safety_tips', 'welcome_message', 'cooking_tips')", name='ck_context')
    )

    # Create indexes for performance
    op.create_index('ix_metaphor_mappings_background_type', 'metaphor_mappings', ['background_type'])
    op.create_index('ix_metaphor_mappings_background_level', 'metaphor_mappings', ['background_level'])
    op.create_index('ix_metaphor_mappings_context', 'metaphor_mappings', ['context'])
    op.create_index('ix_metaphor_mappings_active', 'metaphor_mappings', ['is_active'])


def downgrade():
    op.drop_table('metaphor_mappings')