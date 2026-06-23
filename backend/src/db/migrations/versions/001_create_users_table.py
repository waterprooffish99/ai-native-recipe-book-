"""create users table

Revision ID: 001
Revises:
Create Date: 2025-12-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('oauth_provider', sa.String(50), nullable=True),
        sa.Column('oauth_provider_id', sa.String(255), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('software_background', sa.String(100), nullable=True),
        sa.Column('hardware_background', sa.String(100), nullable=True),
        sa.Column('cooking_level', sa.String(50), nullable=False, server_default='Absolute Beginner'),
        sa.Column('dietary_restrictions', sa.Text(), nullable=True),
        sa.Column('preferred_voice', sa.String(50), nullable=True),
        sa.Column('preferred_language', sa.String(5), nullable=False, server_default='en'),
        sa.Column('recipes_mastered', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_recipe_viewed', UUID(as_uuid=True), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_login', sa.TIMESTAMP(), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create indexes
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_oauth', 'users', ['oauth_provider', 'oauth_provider_id'])


def downgrade():
    op.drop_index('idx_users_oauth', table_name='users')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_table('users')
