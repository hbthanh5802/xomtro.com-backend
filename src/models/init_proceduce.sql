CREATE DEFINER=`root`@`localhost` PROCEDURE `add_post_comment`(
    IN `ownerId` INT,
    IN `commentContent` TEXT,
    IN `tags` VARCHAR(255),
    IN `postId` INT,
    IN `parentCommentId` INT
)
BEGIN
    DECLARE newCommentId INT;
    DECLARE errorMessage VARCHAR(255);

    -- Declare error handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Start transaction
    START TRANSACTION;

    -- Validate comment content
    IF commentContent IS NULL THEN
        SET errorMessage = 'Comment content is required.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;

    IF LENGTH(commentContent) > 1000 THEN
        SET errorMessage = 'Comment content is too long. Maximum 1000 characters.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;
	-- Validate owner ID
    IF ownerId IS NULL OR ownerId <= 0 THEN
        SET errorMessage = 'Invalid owner ID.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;

    -- Validate post ID
    IF postId IS NULL OR postId <= 0 THEN
        SET errorMessage = 'Invalid post ID.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;

	-- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = ownerId) THEN
        SET errorMessage = 'User does not exist.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;

    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = postId) THEN
        SET errorMessage = 'Post does not exist.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
    END IF;

    -- Validate parent comment if provided
    IF parentCommentId IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM post_comments
            WHERE id = parentCommentId AND post_id = postId
        ) THEN
            SET errorMessage = 'Parent comment ID does not exist or does not belong to this post.';
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = errorMessage;
        END IF;
    END IF;

    -- Insert new comment
    INSERT INTO post_comments (owner_id, content, tags, post_id, parent_comment_id)
    VALUES (ownerId, commentContent, tags, postId, parentCommentId);

    -- Get the ID of the newly inserted comment
    SET newCommentId = LAST_INSERT_ID();

    -- Handle closure table for root comment
    IF parentCommentId IS NULL THEN
        INSERT INTO post_comment_closures (ancestor_id, descendant_id, depth)
        VALUES (newCommentId, newCommentId, 0);
    ELSE
        -- Insert ancestors for nested comments
        INSERT INTO post_comment_closures (ancestor_id, descendant_id, depth)
        SELECT ancestor_id, newCommentId, depth + 1
        FROM post_comment_closures
        WHERE descendant_id = parentCommentId;

        -- Insert self reference
        INSERT INTO post_comment_closures (ancestor_id, descendant_id, depth)
        VALUES (newCommentId, newCommentId, 0);
    END IF;

    -- Commit transaction
    COMMIT;

    -- Return the newly inserted comment
    SELECT * FROM post_comments WHERE id = newCommentId;
END
