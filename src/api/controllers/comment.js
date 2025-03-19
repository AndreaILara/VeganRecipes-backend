const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// 📌 Agregar un comentario o respuesta
const addComment = async (req, res) => {
  try {
    const { recipeId, content, parentComment } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Receta no encontrada" });

    const newComment = new Comment({
      content,
      createdBy: req.user._id,
      recipe: recipeId,
      parentComment: parentComment || null,
    });

    await newComment.save();
    await newComment.populate("createdBy", "username avatar");


    res.status(201).json(newComment); // 🔥 Devuelve solo el comentario, no un mensaje
  } catch (error) {
    res.status(500).json({ message: "Error al agregar comentario", error });
  }
};


// 📌 Eliminar un comentario y sus respuestas
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

    if (req.user._id.toString() !== comment.createdBy.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este comentario" });
    }

    // Eliminar todas las respuestas del comentario
    await Comment.deleteMany({ parentComment: comment._id });

    await comment.deleteOne();
    res.json({ message: "Comentario eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar comentario", error });
  }
};

// 📌 Obtener comentarios y sus respuestas
const getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const comments = await Comment.find({ recipe: recipeId, parentComment: null })
      .populate("createdBy", "username avatar") // 🔥 Ahora también trae el avatar

      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("createdBy", "username") // 🔥 Importante incluir el usuario
          .sort({ createdAt: 1 });

        return { ...comment._doc, replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener comentarios", error });
  }
};


module.exports = { addComment, deleteComment, getCommentsByRecipe };
