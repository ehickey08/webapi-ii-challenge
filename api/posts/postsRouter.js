const router = require('express').Router();

const Posts = require('../../data/db');

router.post('/', async (req, res) => {
    try {
        let newPost = req.body;
        if (!req.body.title || !req.body.contents)
            throw { status: 400, message: 'Must include title and contents' };

        const id = await Posts.insert(newPost);

        if (!id.id)
            throw {
                status: 500,
                message:
                    'There was an error while saving the post to the database',
            };

        const post = await Posts.findById(id.id);

        if (!post)
            throw {
                status: 500,
                message:
                    'There was an error while saving the post to the database',
            };

        return res.status(201).json(post);
    } catch (error) {
        return res
            .status(error.status || 500)
            .json({ errorMessage: error.message || 'Internal server error' });
    }
});

router.post('/:id/comments', async (req, res) => {
    let { id } = req.params;
    let comment = req.body;
    if (!comment.text) {
        return res.status(400).json({
            errorMessage: 'Please provide text for the comment.',
        });
    }

    comment.post_id = +id;
    Posts.insertComment(comment)
        .then(id => {
            Posts.findCommentById(id.id)
                .then(comment => {
                    res.status(201).json(comment);
                })
                .catch(err => {
                    res.status(500).json({
                        error:
                            'There was an error while saving the comment to the database',
                    });
                });
        })
        .catch(err => {
            res.status(404).json({
                message: 'The post with the specified ID does not exist.',
            });
        });
});

router.get('/', (req, res) => {
    Posts.find()
        .then(posts => res.status(200).json(posts))
        .catch(err => {
            res.status(500).json({
                error: 'The posts information could not be retrieved.',
            });
        });
});

router.get('/:id', (req, res) => {
    let { id } = req.params;
    Posts.findById(id)
        .then(post => {
            if (post.length) res.status(200).json(post);
            else
                res.status(404).json({
                    message: 'The post with the specified ID does not exist.',
                });
        })
        .catch(err => {
            res.status(500).json({
                message: {
                    error: 'The post information could not be retrieved.',
                },
            });
        });
});

router.get('/:id/comments', (req, res) => {
    let { id } = req.params;
    Posts.findById(id)
        .then(post => {
            if (post.length) {
                Posts.findPostComments(id)
                    .then(comments => {
                        res.status(200).json(comments);
                    })
                    .catch(err => {
                        res.status(500).json({
                            error:
                                'The comments information could not be retrieved.',
                        });
                    });
            } else
                res.status(404).json({
                    error: 'The post with the specified ID does not exist.',
                });
        })
        .catch(err => {
            return res.status(500).json({
                message: 'There was an error while retrieving comments.',
            });
        });
});

router.delete('/:id', (req, res) => {
    let { id } = req.params;
    Posts.findById(id).then(post => {
        Posts.remove(id)
            .then(amt => {
                if (amt) return res.status(200).json(post);
                else
                    res.status(404).json({
                        message:
                            'The post with the specified ID does not exist.',
                    });
            })
            .catch(err => {
                res.status(500).json({
                    error: 'The post could not be removed',
                });
            });
    });
});

router.put('/:id', (req, res) => {
    let { id } = req.params;
    let updatedPost = req.body;
    if (!updatedPost.title || !updatedPost.contents)
        return res.status(400).json({
            errorMessage: 'Please provide title and contents for the post.',
        });
    
    Posts.update(id, updatedPost)
        .then(amt => {
            if (amt) {
                Posts.findById(id)
                    .then(post => {
                        return res.status(200).json(post);
                    })
                    .catch(err => {
                        return res.status(500).json({
                            error:
                                'There was an error after updating your post.',
                        });
                    });
            } else {
                return res.status(404).json({
                    message: 'The post with the specified ID does not exist.',
                });
            }
        })
        .catch(err => {
            return res
                .status(500)
                .json({
                    error: 'There was an error after updating your post.',
                });
        });
});

module.exports = router;
