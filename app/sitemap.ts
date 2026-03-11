import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://portlify.online'
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    const supabase = await createClient()
    
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('username, updated_at')
      .eq('is_public', true)
      .limit(1000)

    if (portfolios && portfolios.length > 0) {
      const portfolioUrls: MetadataRoute.Sitemap = portfolios.map((portfolio) => ({
        url: `${baseUrl}/${portfolio.username}`,
        lastModified: new Date(portfolio.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      return [...staticPages, ...portfolioUrls]
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return staticPages
}
