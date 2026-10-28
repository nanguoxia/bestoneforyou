/**
 * 推广产品配置 - 亚马逊选品展示
 * 后续补充全部产品时只需扩展 PRODUCTS 数组，分类 Tab 会自动生成
 */

export interface Product {
  brand: string;
  name: string;
  points: string[];
  price: number;
  category: string;
  categoryIcon: string;
  image: string;
  link: string;
}

export const PRODUCTS: Product[] = [
  {
    brand: "Doctor's Recipes",
    name: 'Iron Supplement 65 mg with Vitamin C (2-Pack)',
    points: ['Maximized absorption, stomach-friendly', 'Supports red blood cells & immunity', 'Vegan · 120 tablets (2-Pack)'],
    price: 31.99,
    category: 'Iron',
    categoryIcon: '💊',
    image: 'https://m.media-amazon.com/images/I/71Xb6+QC7BL._AC_SX679_PIbundle-2,TopRight,0,0_SH20_.jpg',
    link: 'https://www.amazon.com/dp/B0DDKRXYNC?maas=maas_adg_api_580442218090786307_static_12_201&ref_=aa_maas&tag=maas&aa_campaignid=PB015705ea3d31fd5d013dbc37061e139b&aa_adgroupid=989aFfNXWWBRdCuf4dRdTvRJd54difcM_bO3tJxogNVXFFEVWMsYOfpFpMQHI9N88LGIA0NrJN3Efh2dqSTVCq13IN9FCiLqS6sbwZRE_c&aa_creativeid=5307gtcI08Wco2IO61ULgsXaspf44Jq7klkwopiXYCKDyl4Y&th=1',
  },
  {
    brand: 'VEV',
    name: 'Multi Collagen Peptides Powder (82 Servings)',
    points: ['Hydrolyzed Types I, II, III, V & X', 'Unflavored · mixes with any drink', '32 oz bulk value pack'],
    price: 38.99,
    category: 'Collagen',
    categoryIcon: '✨',
    image: 'https://m.media-amazon.com/images/I/81Jzm70fNtL._AC_SX679_.jpg',
    link: 'https://www.amazon.com/dp/B0DCMG9S1Q?maas=maas_adg_api_581980776735704264_static_12_201&ref_=aa_maas&tag=maas&aa_campaignid=PBc76263f10b84adc2c3c0060e3993e514&aa_adgroupid=280aSfIqgHIDi97l2YGi9WWQdcwgE170ms93SHWLEVXMH00vz6PwOBUiwecuegmEH6yLU_be7k76wHDuqnu7TVKrt&aa_creativeid=554daFJSNDbVIc1ggaMrcohrAugUVPJ5_atk341SkZRGFuy8n&th=1',
  },
  {
    brand: 'VEV Corefeel',
    name: 'Vitamin D3 K2 10,000 IU + Magnesium',
    points: ['High-strength D3 + K2 combo', 'With magnesium for absorption', '300 softgels · 10-month supply'],
    price: 19.99,
    category: 'Vitamins',
    categoryIcon: '🍊',
    image: 'https://m.media-amazon.com/images/I/81De2FxhmOL._AC_SX679_.jpg',
    link: 'https://www.amazon.com/dp/B0F9F5JWXW?lv=shuf&aa_adgroupid=04feasnzDRBqUOoaipE_bW8jwyb5OYlBEpInXH87XNkqW4c7XKtVseH1S30VhlKf4Ur_bHUehHXH6c0jegNcq4KB_ba&th=1&maas=maas_adg_api_581980776735704264_static_12_201&aa_campaignid=PBc76263f10b84adc2c3c0060e3993e514&tag=maas&aa_creativeid=59a7r96vJWjpdl51ShzVvt1TTq5FNlSamfyaiJ_bFxLXX3n5O&channelId=404&ref_=aa_maas&plpRedirect=mhFallback',
  },
  {
    brand: 'VEV',
    name: 'Multi Collagen Peptides Powder (41 Servings)',
    points: ['Types I, II, III, V & X in one scoop', 'Easy trial-size pack', 'Great entry point to collagen'],
    price: 19.99,
    category: 'Collagen',
    categoryIcon: '✨',
    image: 'https://m.media-amazon.com/images/I/81PKQZJZi+L._AC_SX679_.jpg',
    link: 'https://www.amazon.com/dp/B0D3T1SPT4?lv=shuf&aa_adgroupid=e07aeZ0o4u66eLOADfePYYAP13Hd11Qh6xUkaJHWsW2LFRV0nNtVB5pvsuRBwz2EJGIm6Q0vDY4sCqndvUP_ayXIl&th=1&maas=maas_adg_api_581980776735704264_static_12_201&aa_campaignid=PBc76263f10b84adc2c3c0060e3993e514&tag=maas&aa_creativeid=a674FLehXV6dN01RyI0xvrhz124W_btNEwgiQU9iVqJUCOpuh&channelId=404&ref_=aa_maas&plpRedirect=mhFallback',
  },
  {
    brand: 'Vitalitown',
    name: 'Probiotics 120 Billion CFUs, 36 Strains',
    points: ['With prebiotics & digestive enzymes', 'Shelf-stable, no refrigeration', '60 delayed-release capsules'],
    price: 32.99,
    category: 'Probiotics',
    categoryIcon: '🦠',
    image: 'https://m.media-amazon.com/images/I/612ov+NOQ1L._AC_SX679_.jpg',
    link: 'https://www.amazon.com/dp/B0DM5JD6K6?lv=shuf&aa_adgroupid=b9a4eeIcUrvr0wa_bG1YNVpE0EQ25_bBlMHHyAI3dOtAiS0Pk00zRq1SAFCZ0YT4ZO_b6QpZ1xiQ52wTM_a6vEam4eybgGeiir4aKQ_c_c&th=1&maas=maas_adg_api_586541202737670270_static_12_201&aa_campaignid=PBf5dcb95d511afdeb32198d8a3de412bb&tag=maas&aa_creativeid=12c56K93kyTp1juQVKeM1T3G5QJ_bGOnGBJBcCoPqVeUHwH2_a&channelId=404&ref_=aa_maas&plpRedirect=mhFallback',
  },
  {
    brand: 'BassBloom',
    name: 'ROAR 3 Portable Bluetooth Speaker',
    points: ['20W sound in a compact body', 'IPX6 waterproof for outdoors', 'Long-range Bluetooth connection'],
    price: 27.99,
    category: 'Audio',
    categoryIcon: '🔊',
    image: 'https://m.media-amazon.com/images/I/71SjRnpTuUL._AC_SY300_SX300_QL70_FMwebp_.jpg',
    link: 'https://www.amazon.com/dp/B0HJSW1G3J?lv=shuf&aa_adgroupid=71dbwhhP3t5zvo98D4CmlTRTfJWaq6a_a6Zqj72EQ7Bn8UUsRrj5cgwZB5KmoU87Z1trkuxPbXn_aFafirlfrwmResfYkL&maas=maas_adg_api_582667448175021313_static_12_201&aa_campaignid=PBcdfde197a52a530254969227e20b7ed9_9a3bc394d0d7&tag=maas&aa_creativeid=899fs52EO5yB_aY7TPwNzWqJ8iZ_badMiWaY2cHUB1_bR_aSCFxT&channelId=404&ref_=aa_maas&plpRedirect=mhFallback',
  },
  {
    brand: "Doctor's Recipes",
    name: 'Iron Supplement 65 mg with Vitamin C (180 Tabs)',
    points: ['Maximized absorption, stomach-friendly', 'Non-GMO · vegan · 180 tablets', 'Heart, brain & immune support'],
    price: 27.99,
    category: 'Iron',
    categoryIcon: '💊',
    image: 'https://m.media-amazon.com/images/I/61fvxh7J6KL._AC_SY300_SX300_QL70_FMwebp_.jpg',
    link: 'https://www.amazon.com/dp/B0DMN17LV3?lv=shuf&aa_adgroupid=6453sAy4WLIEcJKy9zG_aH9RUgJDNUgI_a5ayDc044fJobwGbPs6R0oflhTQmVHcjLf0IPQ_aBS0ApPuVqTJippEBIAZNCfLEoDoN2JhPo_c&maas=maas_adg_api_580442218090786307_static_12_201&aa_campaignid=PB015705ea3d31fd5d013dbc37061e139b_049b4dade664&tag=maas&aa_creativeid=8c76IgOkIwGXYsjbGly9MLpDDI0_adqeZQ4Z81Xv54c8X_a5dP&channelId=404&ref_=aa_maas&plpRedirect=mhFallback&content_source=fb&fb_content_id=Q9-wBQFPJb_5JKKh3ibUrIcjuzsFcdwR5XQZnzhLDDBb5NZWfJTWQoWZxv0Sx46Zw-th&channel_type=fb&utm_medium=paid&utm_source=fb&utm_id=120251192592470344&utm_content=120251192592490344&utm_term=120251192592480344&utm_campaign=120251192592470344&fbclid=IwY2xjawVOMgxleHRuA2FlbQEwAGFmZGsJSzJZTkNtX01ycHRpZAGxzXdL_wEZcGRvZgVhZGlkAas30txsOohzcnRjBmFwcF9pBAyMjIwMzkxNzg4MjAwODkyAAEel1lRjtI7oHtV7RZzk2PAxlIP0W__YiCud4h7qFJE3466QSh1xjUdWxQsack_aem_u7cmbcWLpC6AxOIEL7b6DA',
  },
];
