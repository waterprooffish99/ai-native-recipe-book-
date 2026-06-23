"""add foreign key constraints

Revision ID: 005
Revises: 004
Create Date: 2025-12-23

"""
from alembic import op

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Add foreign key from sessions to users
    op.create_foreign_key(
        'fk_sessions_user_id',
        'sessions', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )

    # Add foreign key from survey_responses to users
    op.create_foreign_key(
        'fk_survey_responses_user_id',
        'survey_responses', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade():
    op.drop_constraint('fk_survey_responses_user_id', 'survey_responses', type_='foreignkey')
    op.drop_constraint('fk_sessions_user_id', 'sessions', type_='foreignkey')
