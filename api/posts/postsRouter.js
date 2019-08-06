const router = require('express').Router();

const Posts = require('../../data/db');

router.post('/', (req, res) => {
    let newPost = req.body;
    if (!req.body.title || !req.body.contents)
        res.status(400).json({
            errorMessage: 'Please provide title and contents for the post.',
        });
    else {
        Posts.insert(newPost)
            .then(id => {
                Posts.findById(id.id)
                    .then(post => {
                        res.status(201).json(post);
                    })
                    .catch(err => {
                        res.status(500).json({
                            error:
                                'There was an error after your post was successfully added.',
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    error:
                        'There was an error while saving the post to the database',
                });
            });
    }
});

router.post('/:id/comments', (req, res) => {
    let { id } = req.params;
    let comment = req.body;
    if (!comment.text)
        res.status(400).json({
            errorMessage: 'Please provide text for the comment.',
        });

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
            if (post[0].id) res.status(200).json(post);
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
    Posts.findPostComments(id)
        .then(comments => {
            if (comments.length) res.status(200).json(comments);
            else
                res.status(404).json({
                    message: 'The post with the specified ID does not exist.',
                });
        })
        .catch(err => {
            res.status(500).json({
                error: 'The comments information could not be retrieved.',
            });
        });
});

router.delete('/:id', (req, res) => {
    let { id } = req.params;
   let postToDelete = Posts.findById(id).then(post => {
        return post
    });
    console.log(postToDelete)
    Posts.remove(id)
        .then(amt => {
            if (amt) res.status(200).json(postToDelete);
            else
                res.status(404).json({
                    message: 'The post with the specified ID does not exist.',
                });
        })
        .catch(err => {
            res.status(500).json({ error: 'The post could not be removed' });
        });
});

router.put('/:id', (req, res) => {});

module.exports = router;
