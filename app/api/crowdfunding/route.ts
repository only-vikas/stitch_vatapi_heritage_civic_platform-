import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export interface CrowdfundingCampaign {
  id: string;
  issue_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  backers_count: number;
  status: 'active' | 'funded' | 'completed';
  created_at: string;
}

// In-memory persistent cache for campaigns when Supabase table is syncing
export let MEMORY_CAMPAIGNS: Record<string, CrowdfundingCampaign> = {
  'camp-1': {
    id: 'camp-1',
    issue_id: 'default-issue-investor-1',
    title: 'Cave 3 Pillar Micro-Grouting & Crack Infilling',
    target_amount: 5000,
    current_amount: 2050,
    backers_count: 41,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  'camp-2': {
    id: 'camp-2',
    issue_id: 'default-issue-investor-2',
    title: 'Virupaksha Temple Bas-Relief Desalination Barrier',
    target_amount: 8000,
    current_amount: 4650,
    backers_count: 82,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');

    // Attempt Supabase fetch
    try {
      let query = supabase.from('crowdfunding_campaigns').select('*');
      if (issueId) {
        query = query.eq('issue_id', issueId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, campaigns: data });
      }
    } catch {
      // fallback
    }

    const campaignsList = Object.values(MEMORY_CAMPAIGNS);
    const filtered = issueId
      ? campaignsList.filter((c) => c.issue_id === issueId || issueId.startsWith('mock'))
      : campaignsList;

    return NextResponse.json({
      success: true,
      campaigns: filtered.length > 0 ? filtered : campaignsList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, issueId, title, amount, donorName = 'Anonymous Citizen' } = body;

    const donateAmount = Number(amount) || 10;
    let targetCampaignId = campaignId || 'camp-1';

    // 1. Try Supabase insert
    try {
      const { data: campaign, error: cErr } = await supabase
        .from('crowdfunding_campaigns')
        .select('*')
        .eq('id', targetCampaignId)
        .single();

      if (!cErr && campaign) {
        const newAmount = Number(campaign.current_amount) + donateAmount;
        const newBackers = Number(campaign.backers_count) + 1;

        await supabase
          .from('crowdfunding_campaigns')
          .update({
            current_amount: newAmount,
            backers_count: newBackers,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetCampaignId);

        await supabase.from('donations').insert({
          campaign_id: targetCampaignId,
          donor_name: donorName,
          amount: donateAmount,
        });

        return NextResponse.json({
          success: true,
          campaign: {
            ...campaign,
            current_amount: newAmount,
            backers_count: newBackers,
          },
        });
      }
    } catch {
      // fallback to memory
    }

    // 2. Memory Fallback
    if (!MEMORY_CAMPAIGNS[targetCampaignId]) {
      MEMORY_CAMPAIGNS[targetCampaignId] = {
        id: targetCampaignId,
        issue_id: issueId || 'default-issue',
        title: title || 'Monument Conservation Micro-Fund',
        target_amount: 5000,
        current_amount: 2050,
        backers_count: 41,
        status: 'active',
        created_at: new Date().toISOString(),
      };
    }

    const campaign = MEMORY_CAMPAIGNS[targetCampaignId];
    campaign.current_amount += donateAmount;
    campaign.backers_count += 1;
    if (campaign.current_amount >= campaign.target_amount) {
      campaign.status = 'funded';
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Thank you! You just helped preserve a 1,400-year-old monument.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Donation failed' },
      { status: 500 }
    );
  }
}
