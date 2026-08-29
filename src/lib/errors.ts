export const messageForError = (error: unknown) => error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
