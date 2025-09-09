import { supabase } from './supabase'

export const schedulingService = {
  // Obtener configuraciones de programación
  async getSchedulingConfigs(userId) {
    try {
      const { data, error } = await supabase
        .from('scheduling_configs')
        .select(`
          *,
          linkedin_profiles (
            id,
            name,
            profile_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting scheduling configs:', error)
      return { data: null, error }
    }
  },

  // Crear o actualizar configuración de programación
  async saveSchedulingConfig(userId, linkedinProfileId, config) {
    try {
      const { data, error } = await supabase
        .from('scheduling_configs')
        .upsert({
          user_id: userId,
          linkedin_profile_id: linkedinProfileId,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving scheduling config:', error)
      return { data: null, error }
    }
  },

  // Obtener posts programados
  async getScheduledPosts(userId, filters = {}) {
    try {
      let query = supabase
        .from('scheduled_posts')
        .select(`
          *,
          linkedin_profiles (
            id,
            name,
            profile_url
          ),
          news (
            id,
            title,
            url,
            source
          )
        `)
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true })

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.linkedinProfileId) {
        query = query.eq('linkedin_profile_id', filters.linkedinProfileId)
      }
      if (filters.dateFrom) {
        query = query.gte('scheduled_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('scheduled_at', filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting scheduled posts:', error)
      return { data: null, error }
    }
  },

  // Programar un post
  async schedulePost(userId, postData) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: userId,
          ...postData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error scheduling post:', error)
      return { data: null, error }
    }
  },

  // Actualizar post programado
  async updateScheduledPost(postId, updates) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating scheduled post:', error)
      return { data: null, error }
    }
  },

  // Cancelar post programado
  async cancelScheduledPost(postId) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error cancelling scheduled post:', error)
      return { data: null, error }
    }
  },

  // Eliminar post programado
  async deleteScheduledPost(postId) {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting scheduled post:', error)
      return { data: null, error }
    }
  },

  // Programar múltiples posts automáticamente
  async scheduleMultiplePosts(userId, linkedinProfileId, newsItems, config) {
    try {
      const posts = []
      const now = new Date()
      
      // Calcular fechas de programación basadas en la configuración
      const scheduledDates = this.calculateSchedulingDates(config, newsItems.length)
      
      for (let i = 0; i < newsItems.length; i++) {
        const newsItem = newsItems[i]
        const scheduledDate = scheduledDates[i]
        
        if (scheduledDate) {
          posts.push({
            user_id: userId,
            linkedin_profile_id: linkedinProfileId,
            news_id: newsItem.id,
            title: newsItem.title,
            content: newsItem.summary || newsItem.description,
            summary: newsItem.summary,
            hashtags: newsItem.hashtags || [],
            image_url: newsItem.image_url,
            scheduled_at: scheduledDate.toISOString(),
            timezone: config.timezone || 'America/Mexico_City',
            status: 'scheduled'
          })
        }
      }

      if (posts.length === 0) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(posts)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error scheduling multiple posts:', error)
      return { data: null, error }
    }
  },

  // Calcular fechas de programación
  calculateSchedulingDates(config, postCount) {
    const dates = []
    const now = new Date()
    let currentDate = new Date(now)
    
    // Ajustar a la zona horaria
    const timezone = config.timezone || 'America/Mexico_City'
    
    for (let i = 0; i < postCount; i++) {
      // Encontrar el próximo día hábil disponible
      let dayConfig = this.getDayConfig(config, currentDate.getDay())
      
      while (!dayConfig.enabled || dayConfig.postsCount === 0) {
        currentDate.setDate(currentDate.getDate() + 1)
        dayConfig = this.getDayConfig(config, currentDate.getDay())
      }
      
      // Calcular hora de publicación
      const startTime = this.parseTime(dayConfig.startTime)
      const endTime = this.parseTime(dayConfig.endTime)
      
      // Distribuir posts a lo largo del día
      const timeInterval = (endTime - startTime) / dayConfig.postsCount
      const postTime = startTime + (i % dayConfig.postsCount) * timeInterval
      
      const scheduledDate = new Date(currentDate)
      scheduledDate.setHours(Math.floor(postTime), (postTime % 1) * 60, 0, 0)
      
      dates.push(scheduledDate)
      
      // Si hemos usado todos los slots del día, pasar al siguiente
      if ((i + 1) % dayConfig.postsCount === 0) {
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }
    
    return dates
  },

  // Obtener configuración del día
  getDayConfig(config, dayOfWeek) {
    const dayConfigs = {
      0: { // Domingo
        enabled: config.sunday_enabled,
        startTime: config.sunday_start_time,
        endTime: config.sunday_end_time,
        postsCount: config.sunday_posts_count
      },
      1: { // Lunes
        enabled: config.monday_enabled,
        startTime: config.monday_start_time,
        endTime: config.monday_end_time,
        postsCount: config.monday_posts_count
      },
      2: { // Martes
        enabled: config.tuesday_enabled,
        startTime: config.tuesday_start_time,
        endTime: config.tuesday_end_time,
        postsCount: config.tuesday_posts_count
      },
      3: { // Miércoles
        enabled: config.wednesday_enabled,
        startTime: config.wednesday_start_time,
        endTime: config.wednesday_end_time,
        postsCount: config.wednesday_posts_count
      },
      4: { // Jueves
        enabled: config.thursday_enabled,
        startTime: config.thursday_start_time,
        endTime: config.thursday_end_time,
        postsCount: config.thursday_posts_count
      },
      5: { // Viernes
        enabled: config.friday_enabled,
        startTime: config.friday_start_time,
        endTime: config.friday_end_time,
        postsCount: config.friday_posts_count
      },
      6: { // Sábado
        enabled: config.saturday_enabled,
        startTime: config.saturday_start_time,
        endTime: config.saturday_end_time,
        postsCount: config.saturday_posts_count
      }
    }
    
    return dayConfigs[dayOfWeek] || dayConfigs[1] // Default to Monday
  },

  // Parsear tiempo (HH:MM) a decimal
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours + minutes / 60
  }
}
