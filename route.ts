src\app\api\team-logs\route.ts

import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

interface TeamLogRequest {
  session_id: string;
  member_id: string;
  team_id: string;
  date: string;
  user_name: string;
  agent_name: string;
  user_picture?: string;
  user_avatar?: string;
  agent_picture?: string;
  avatar_category?: string;
  avatar_difficulty?: string;
  call_recording_url?: string;
  overall_score: number;
  overall_score_text?: string;
  engagement_score: number;
  engagement_text?: string;
  objection_handling_score: number;
  objection_handling_text?: string;
  information_gathering_score: number;
  information_gathering_text?: string;
  program_explanation_score: number;
  program_explanation_text?: string;
  closing_skills_score: number;
  closing_skills_text?: string;
  overall_effectiveness_score: number;
  overall_effectiveness_text?: string;
  transcript?: string;
  power_moment?: string;
  call_notes?: string;
  level_up_plan_1?: string;
  level_up_plan_2?: string;
  level_up_plan_3?: string;
  manager_feedback?: string;
}

export async function POST(request: Request) {
  try {
    const data: TeamLogRequest = await request.json();
    
    // Validate required fields
    if (!data.member_id || !data.team_id || !data.date || !data.user_name || !data.agent_name || !data.session_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: member_id, team_id, date, user_name, agent_name, and session_id are required' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Validate score fields
    const scoreFields = ['overall_score', 'engagement_score', 'objection_handling_score', 
                        'information_gathering_score', 'program_explanation_score', 
                        'closing_skills_score', 'overall_effectiveness_score'];
                        
    for (const field of scoreFields) {
      if (data[field as keyof TeamLogRequest] !== undefined) {
        const score = Number(data[field as keyof TeamLogRequest]);
        if (isNaN(score) || score < 0 || score > 100) {
          return NextResponse.json({ 
            error: `Invalid score for ${field}. Must be a number between 0 and 100` 
          }, { status: 400, headers: corsHeaders() });
        }
      }
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      INSERT INTO "Team_Logs" (
        session_id,
        member_id,
        team_id,
        date,
        user_name,
        user_picture,
        user_avatar,
        agent_name,
        agent_picture,
        avatar_category,
        avatar_difficulty,
        call_recording_url,
        overall_score,
        overall_score_text,
        engagement_score,
        engagement_text,
        objection_handling_score,
        objection_handling_text,
        information_gathering_score,
        information_gathering_text,
        program_explanation_score,
        program_explanation_text,
        closing_skills_score,
        closing_skills_text,
        overall_effectiveness_score,
        overall_effectiveness_text,
        transcript,
        power_moment,
        call_notes,
        level_up_plan_1,
        level_up_plan_2,
        level_up_plan_3,
        manager_feedback
      ) VALUES (
        ${data.session_id},
        ${data.member_id},
        ${data.team_id},
        ${data.date},
        ${data.user_name},
        ${data.user_picture || null},
        ${data.user_avatar || null},
        ${data.agent_name},
        ${data.agent_picture || null},
        ${data.avatar_category || null},
        ${data.avatar_difficulty || null},
        ${data.call_recording_url || null},
        ${data.overall_score},
        ${data.overall_score_text || null},
        ${data.engagement_score},
        ${data.engagement_text || null},
        ${data.objection_handling_score},
        ${data.objection_handling_text || null},
        ${data.information_gathering_score},
        ${data.information_gathering_text || null},
        ${data.program_explanation_score},
        ${data.program_explanation_text || null},
        ${data.closing_skills_score},
        ${data.closing_skills_text || null},
        ${data.overall_effectiveness_score},
        ${data.overall_effectiveness_text || null},
        ${data.transcript || null},
        ${data.power_moment || null},
        ${data.call_notes || null},
        ${data.level_up_plan_1 || null},
        ${data.level_up_plan_2 || null},
        ${data.level_up_plan_3 || null},
        ${data.manager_feedback || null}
      ) RETURNING *
    `;

    return NextResponse.json(rows[0], { headers: corsHeaders() });

  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ 
      error: 'Failed to create team log',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders() });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const memberId = searchParams.get('memberId');
  
  if (!teamId || !memberId) {
    return NextResponse.json({ error: 'Team ID and Member ID required' }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });
    
    const { rows } = await pool.sql`
      SELECT * FROM "Team_Logs" 
      WHERE team_id = ${teamId} 
      ORDER BY date DESC
    `;


    const transformedRows = rows.map(row => ({
      ...row,
      date: row.date.toISOString(),
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }));

    return NextResponse.json(transformedRows, { headers: corsHeaders() });

  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ 
      error: 'Failed to fetch team logs',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const member_id = searchParams.get('member_id');
  const session_id = searchParams.get('session_id');
  
  if (!member_id || !session_id) {
    return NextResponse.json({ error: 'Member ID and Session ID required' }, { 
      status: 400, 
      headers: corsHeaders() 
    });
  }

  try {
    const data = await request.json();
    
    if (!data.manager_feedback) {
      return NextResponse.json({ error: 'Manager feedback required' }, { 
        status: 400, 
        headers: corsHeaders() 
      });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });
    
    // Update using both member_id AND session_id
    const { rows } = await pool.sql`
      UPDATE "Team_Logs"
      SET manager_feedback = ${data.manager_feedback},
          updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${member_id}
        AND session_id = ${session_id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Log not found' }, { 
        status: 404, 
        headers: corsHeaders() 
      });
    }

    // Send to N8N webhook with error handling
    try {
      const webhookResponse = await fetch("https://aiemployee.app.n8n.cloud/webhook/ced13db0-75fa-40ff-bf8b-1faad8bee702", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.manager_feedback,
          sessionId: session_id
        })
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Webhook failed with status:', webhookResponse.status, 'Error:', errorText);
      }
    } catch (webhookError) {
      console.error('Failed to send to webhook:', webhookError);
      // Continue with the response even if webhook fails
    }

    return NextResponse.json(rows[0], { headers: corsHeaders() });

  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ 
      error: 'Failed to update team log',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders() });
  }
}
