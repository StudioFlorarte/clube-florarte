import type { Locale } from './i18n'

export type Attachment = { path: string; name: string; type: string; size: number; alt?: string }
export const fileTypes: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'application/pdf': 'pdf', 'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}
export const communityMessages = {
  feed: ['Início', 'Home', 'Accueil', 'Inicio'],
  updates: ['Novidades do Clube', 'Club updates', 'Actualités du Club', 'Novedades del Club'],
  feedHelp: ['Um espaço para acompanhar as novidades e conversar com o Clube.', 'A space to follow updates and connect with the Club.', 'Un espace pour suivre les nouveautés et échanger avec le Club.', 'Un espacio para seguir las novedades y conversar con el Club.'],
  publishIn: ['Publicar em', 'Publish in', 'Publier en', 'Publicar en'],
  separate: ['Cada idioma tem suas próprias publicações.', 'Each language has its own posts.', 'Chaque langue a ses propres publications.', 'Cada idioma tiene sus propias publicaciones.'],
  write: ['O que você quer compartilhar?', 'What would you like to share?', 'Que souhaitez-vous partager ?', '¿Qué quieres compartir?'],
  attach: ['Adicionar imagens, vídeos ou documentos', 'Add images, videos or documents', 'Ajouter des images, vidéos ou documents', 'Añadir imágenes, vídeos o documentos'],
  limits: ['Até 10 arquivos, 50 MB por arquivo. PNG, JPG, WebP, GIF, MP4, WebM, PDF, DOCX, PPTX, XLSX ou TXT.', 'Up to 10 files, 50 MB each. PNG, JPG, WebP, GIF, MP4, WebM, PDF, DOCX, PPTX, XLSX or TXT.', 'Jusqu’à 10 fichiers de 50 Mo chacun. PNG, JPG, WebP, GIF, MP4, WebM, PDF, DOCX, PPTX, XLSX ou TXT.', 'Hasta 10 archivos, 50 MB cada uno. PNG, JPG, WebP, GIF, MP4, WebM, PDF, DOCX, PPTX, XLSX o TXT.'],
  alt: ['Descrição acessível da imagem', 'Accessible image description', 'Description accessible de l’image', 'Descripción accesible de la imagen'],
  publish: ['Publicar', 'Publish', 'Publier', 'Publicar'],
  publishing: ['Publicando…', 'Publishing…', 'Publication…', 'Publicando…'],
  published: ['Publicação enviada para o idioma escolhido.', 'Post published in the selected language.', 'Publication envoyée dans la langue choisie.', 'Publicación enviada al idioma elegido.'],
  empty: ['As novidades neste idioma aparecerão aqui.', 'Updates in this language will appear here.', 'Les actualités dans cette langue apparaîtront ici.', 'Las novedades en este idioma aparecerán aquí.'],
  like: ['Curtir', 'Like', 'J’aime', 'Me gusta'],
  liked: ['Curtido', 'Liked', 'J’aime', 'Me gusta'],
  comments: ['Comentários', 'Comments', 'Commentaires', 'Comentarios'],
  comment: ['Escreva um comentário', 'Write a comment', 'Écrivez un commentaire', 'Escribe un comentario'],
  send: ['Comentar', 'Comment', 'Commenter', 'Comentar'],
  more: ['Carregar mais', 'Load more', 'Afficher plus', 'Cargar más'],
  previous: ['Anterior', 'Previous', 'Précédent', 'Anterior'],
  next: ['Próxima', 'Next', 'Suivant', 'Siguiente'],
  download: ['Baixar', 'Download', 'Télécharger', 'Descargar'],
  remove: ['Remover', 'Remove', 'Retirer', 'Quitar'],
  hide: ['Retirar do feed', 'Unpublish', 'Dépublier', 'Retirar del feed'],
  confirmHide: ['Retirar esta publicação do feed?', 'Unpublish this post?', 'Dépublier cette publication ?', '¿Retirar esta publicación del feed?'],
  confirmComment: ['Remover este comentário?', 'Remove this comment?', 'Supprimer ce commentaire ?', '¿Eliminar este comentario?'],
  notifications: ['Notificações', 'Notifications', 'Notifications', 'Notificaciones'],
  readAll: ['Marcar todas como lidas', 'Mark all as read', 'Tout marquer comme lu', 'Marcar todas como leídas'],
  noNotifications: ['Nenhuma novidade por aqui ainda.', 'No updates yet.', 'Aucune nouveauté pour le moment.', 'Todavía no hay novedades.'],
  new: ['Não lida', 'Unread', 'Non lue', 'Sin leer'],
  all: ['Ver todas', 'View all', 'Tout voir', 'Ver todas'],
  error: ['Não foi possível concluir. Tente novamente.', 'Could not complete this action. Please try again.', 'Impossible de terminer. Réessayez.', 'No se pudo completar. Inténtalo de nuevo.'],
  invalid: ['Confira o tipo, a quantidade e o tamanho dos arquivos.', 'Check the file types, count and sizes.', 'Vérifiez le type, le nombre et la taille des fichiers.', 'Revisa el tipo, la cantidad y el tamaño de los archivos.'],
  png: ['Baixar PNG', 'Download PNG', 'Télécharger PNG', 'Descargar PNG'],
  zip: ['Baixar conjunto', 'Download collection', 'Télécharger la collection', 'Descargar colección'],
  iconHelp: ['Escolha um conjunto e salve os PNGs para usar no Canva.', 'Choose a collection and save the PNGs to use in Canva.', 'Choisissez une collection et enregistrez les PNG pour Canva.', 'Elige una colección y guarda los PNG para usarlos en Canva.'],
  manageFeed: ['Publicar novidades no feed', 'Publish feed updates', 'Publier dans le fil', 'Publicar novedades en el feed'],
} as const
export type CommunityKey = keyof typeof communityMessages
export function communityText(locale: Locale, key: CommunityKey) {
  return communityMessages[key][(['pt', 'en', 'fr', 'es'] as const).indexOf(locale)]
}
export function assetUrl(bucket: 'feed-assets' | 'club-icons', path: string, download = false) {
  return `/api/assets?bucket=${bucket}&path=${encodeURIComponent(path)}${download ? '&download=1' : ''}`
}
