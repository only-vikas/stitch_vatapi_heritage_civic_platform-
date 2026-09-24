const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://wydpvuumgrmimrdyymvs.supabase.co', 'sb_publishable_M4UdvIUJu8XGbKiq3MxzPA_LjCtNO8u');

async function seed() {
  const kitchens = [
    {
      name: 'Shri Shakambhari Jolada Rotti Mane',
      location: '350m from Durga Temple, Aihole',
      distance: '0.35 km',
      dietary_tags: ['100% Pure Veg (Sattvic)', 'Wood-fired Tawa', 'Jain Friendly'],
      verified: true,
      specialty_dish: 'Jolada Rotti Meals, Ennegai, Shenga Chutney & Buttermilk',
      rating: 4.9
    },
    {
      name: "Akka's Village Meals & Agastya Kitchen",
      location: '1.2 km from Badami Cave 1',
      distance: '1.2 km',
      dietary_tags: ['Pure Veg', 'Gluten-Free Sorghum', 'Fresh Country Curds'],
      verified: true,
      specialty_dish: 'Woodfired Jowar Bhakri, Organic Curd & Churned Butter',
      rating: 4.8
    },
    {
      name: 'Grama Devata Rasoi & Rotti Mane',
      location: '2.1 km from Pattadakal Virupaksha Temple',
      distance: '2.1 km',
      dietary_tags: ['Pure Veg', 'Farm-to-Plate Millet', 'Sweet Holige Included'],
      verified: true,
      specialty_dish: 'Sajjige & Shenga Holige, Kaalu Palya with Roasted Flaxseed',
      rating: 4.9
    },
    {
      name: 'Guledgudda Khana Rotti & Holige Mane',
      location: 'Main Bazar, Guledgudda',
      distance: '0.6 km',
      dietary_tags: ['Vegetarian', 'Weaver Thali', 'Wood-fired'],
      verified: true,
      specialty_dish: 'Crisp Sajje Rotti, Shenga Chutney & Holige',
      rating: 4.8
    }
  ];

  for (const k of kitchens) {
    const { data: existing } = await sb.from('food_kitchens').select('id').eq('name', k.name);
    if (!existing || existing.length === 0) {
      const { error } = await sb.from('food_kitchens').insert(k);
      console.log('Inserting:', k.name, error ? error.message : 'OK');
    } else {
      console.log('Already exists:', k.name);
    }
  }
}

seed();
