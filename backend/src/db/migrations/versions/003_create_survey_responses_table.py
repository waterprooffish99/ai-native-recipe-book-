"""create survey responses table

Revision ID: 003
Revises: 002
Create Date: 2025-12-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'survey_responses',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column('software_background', sa.String(100), nullable=True),
        sa.Column('hardware_background', sa.String(100), nullable=True),
        sa.Column('cooking_level', sa.String(50), nullable=False),
        sa.Column('dietary_restrictions', sa.Text(), nullable=True),
        sa.Column('preferred_voice', sa.String(50), nullable=False),
        sa.Column('preferred_language', sa.String(5), nullable=False),
        sa.Column('submitted_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create index
    op.create_index('idx_survey_user_id', 'survey_responses', ['user_id'])


def downgrade():
    op.drop_index('idx_survey_user_id', table_name='survey_responses')
    op.drop_table('survey_responses')
