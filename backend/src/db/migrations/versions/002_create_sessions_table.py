"""create sessions table

Revision ID: 002
Revises: 001
Create Date: 2025-12-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.String(500), nullable=False, unique=True),
        sa.Column('expires_at', sa.TIMESTAMP(), nullable=False),
        sa.Column('device_info', JSONB, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create indexes
    op.create_index('idx_sessions_user_id', 'sessions', ['user_id'])
    op.create_index('idx_sessions_token', 'sessions', ['token'])
    op.create_index('idx_sessions_expires_at', 'sessions', ['expires_at'])


def downgrade():
    op.drop_index('idx_sessions_expires_at', table_name='sessions')
    op.drop_index('idx_sessions_token', table_name='sessions')
    op.drop_index('idx_sessions_user_id', table_name='sessions')
    op.drop_table('sessions')
