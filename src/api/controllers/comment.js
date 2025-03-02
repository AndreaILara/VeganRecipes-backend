const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// Agregar un comentario a una receta
const addComment = async (req, res) => {
  try {
    const { recipeId, content } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    const newComment = new Comment({
      content,
      createdBy: req.user._id,
      recipe: recipeId,
    });

    await newComment.save();
    res.status(201).json({ message: "Comentario agregado con éxito", newComment });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar comentario", error });
  }
};

// Eliminar un comentario (solo el creador o admin)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

    // Verificar permisos
    if (req.user._id.toString() !== comment.createdBy.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este comentario" });
    }

    await comment.deleteOne();
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar comentario", error });
  }
};

// Obtener comentarios de una receta
const getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const comments = await Comment.find({ recipe: recipeId }).populate("createdBy", "username");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener comentarios", error });
  }
};

module.exports = { addComment, deleteComment, getCommentsByRecipe };
