"""seed metaphor mappings

Revision ID: 4e6f9a2c3d4e
Revises: 3d5e8f9a1b2c
Create Date: 2025-12-25 12:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers
revision = '4e6f9a2c3d4e'
down_revision = '3d5e8f9a1b2c'
branch_labels = None
depends_on = None


def upgrade():
    metaphor_mappings_table = sa.table('metaphor_mappings',
        sa.column('mapping_id', postgresql.UUID()),
        sa.column('background_type', sa.String()),
        sa.column('background_level', sa.String()),
        sa.column('context', sa.String()),
        sa.column('metaphor_template', sa.Text()),
        sa.column('is_active', sa.Boolean())
    )

    # Insert metaphor mappings for software background
    op.bulk_insert(metaphor_mappings_table, [
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'beginner',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome! Cooking is like learning to code - start with simple "functions" (recipes) and gradually build up your "library" of skills. Each recipe is a small program that, when executed properly, produces a delicious result.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'intermediate',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome back! Think of cooking like debugging - you need to carefully follow each step, test your results, and iterate until you achieve the perfect outcome. The kitchen is your development environment!',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'expert',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome, fellow engineer! Cooking is like deploying to production - every step matters, preparation is key, and the final result is a beautiful, working system. Let\'s build something amazing together.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'beginner',
            'context': 'recipe_explanation',
            'metaphor_template': 'Think of this recipe as a simple script. Each ingredient is a variable, and each step is a function call. Just like in programming, order matters - you need to prepare ingredients (initialize variables) before using them.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'intermediate',
            'context': 'recipe_explanation',
            'metaphor_template': 'This recipe is like a well-structured function with clear inputs (ingredients) and outputs (the final dish). The cooking time is like execution time, and temperature control is like managing system resources.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'expert',
            'context': 'recipe_explanation',
            'metaphor_template': 'This recipe operates like a distributed system where timing and coordination between components is critical. Each cooking step is a microservice that must complete before the next can begin, with proper error handling for unexpected conditions.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'beginner',
            'context': 'safety_tips',
            'metaphor_template': 'Kitchen safety is like code security - always validate your inputs (ingredients), handle exceptions (spills or burns) gracefully, and never run code (cooking) with elevated privileges (careless attention) without proper checks.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'intermediate',
            'context': 'safety_tips',
            'metaphor_template': 'Just as you test code before deployment, always test temperature with your hand before touching hot surfaces. Think of kitchen safety protocols as your error handling - they prevent catastrophic failures.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'software',
            'background_level': 'expert',
            'context': 'safety_tips',
            'metaphor_template': 'Treat kitchen safety like system monitoring - continuously watch for potential issues, have backup plans, and maintain awareness of all processes running simultaneously to prevent resource contention (burning multiple items).',
            'is_active': True
        },
        # Hardware background metaphors
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'beginner',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome! Cooking is like assembling a computer - you need the right components (ingredients), follow the manual (recipe), and make sure everything connects properly. Each dish is a successful build!',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'intermediate',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome back! Cooking is like circuit design - it requires precision, understanding of how components interact, and attention to timing. The kitchen tools are your instruments for measuring and controlling the process.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'expert',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome, hardware expert! Cooking is like designing a complex system where thermal management, signal timing, and component compatibility are critical. Every dish is a perfectly tuned circuit.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'beginner',
            'context': 'recipe_explanation',
            'metaphor_template': 'Think of this recipe like a hardware assembly guide. Each ingredient is a component you need to gather, and each step is an assembly instruction. Just like building a PC, timing and sequence are crucial for success.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'intermediate',
            'context': 'recipe_explanation',
            'metaphor_template': 'This recipe is like configuring a system - you need to set the right parameters (temperature, timing), ensure proper connections (mixing ingredients), and monitor for optimal performance (texture, color, aroma).',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'expert',
            'context': 'recipe_explanation',
            'metaphor_template': 'This recipe operates like a precision engineering process where thermal dynamics, material properties, and timing must be perfectly calibrated. Each cooking technique is like a manufacturing process with specific parameters.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'beginner',
            'context': 'safety_tips',
            'metaphor_template': 'Kitchen safety is like ESD protection - always ground yourself (stay focused), handle components carefully (hot items), and work in a controlled environment. A clean workspace prevents static discharge (accidents).',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'intermediate',
            'context': 'safety_tips',
            'metaphor_template': 'Just as you handle sensitive components with care, treat sharp knives and hot surfaces with respect. Think of safety equipment (oven mitts, pot holders) as your ESD-safe tools.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'hardware',
            'background_level': 'expert',
            'context': 'safety_tips',
            'metaphor_template': 'Approach kitchen safety like system safety - implement multiple layers of protection, continuously monitor for potential hazards, and maintain awareness of all operational parameters to prevent failures.',
            'is_active': True
        },
        # Cooking background metaphors
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'cooking',
            'background_level': 'beginner',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome to your culinary journey! Every master chef started with simple recipes. Each dish you complete builds your foundation, just like learning to walk before you run.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'cooking',
            'background_level': 'intermediate',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome back! You\'re developing your culinary voice and technique. Each recipe is an opportunity to refine your skills and explore new flavor combinations.',
            'is_active': True
        },
        {
            'mapping_id': uuid.uuid4(),
            'background_type': 'cooking',
            'background_level': 'expert',
            'context': 'welcome_message',
            'metaphor_template': 'Welcome, culinary artist! You understand the science and art of cooking. Let\'s explore advanced techniques and flavor profiles that will challenge even your experienced palate.',
            'is_active': True
        }
    ])


def downgrade():
    # Delete all metaphor mappings
    op.execute("DELETE FROM metaphor_mappings WHERE context IN ('welcome_message', 'recipe_explanation', 'safety_tips')")