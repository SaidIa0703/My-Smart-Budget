const express = require('express');
const router = express.Router();
const pool = require('.../config/db');
const authMiddleware = require('../middleware/auth');

outer.get('/', authMiddleware, async (req, res) => {

  try {

    const { profileId, month } = req.query;

    const result = await pool.query(

      `

      SELECT * FROM budgets

      WHERE profile_id = $1 AND month = $2

      ORDER BY category ASC

      `,

      [profileId, month]

    );

    res.json(result.rows);

  } catch (error) {

    console.error('GET budgets error:', error);

    res.status(500).json({ error: 'Erreur serveur' });

  }

});

router.post('/', authMiddleware, async (req, res) => {
    try{
        const {profile_id, category, limit_amount, month } = req.body;
        
        const result =  await pool.query(
            `
            INSERT INTO budgets (profile_id, category, limit_amount, month )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `
            ,
            [profile_id, category, limit_amount, month]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('POST budgets error', error);
        res.status(500).json({ error: 'Erreur serveur'});
    }
});

router.put('/:id', authMiddleware, async (req, res)=> {
    try{
        const {id} = req.params;
        const {category, limit_amount, month} = req.body;

        const result = await pool.query(
            `
            UPDATE budgets
            SET category = $1,
                limit_amount = $2
                month = $3
            WHERE id = $4
            RETURNING *
            `
            ,
            [category, limit_amount, month, id]
        );
        if(result.rows.length ===0 ){
            return res.status(404).json({error: 'Budget introuvable'});
        }
        res.json(result.rows[0]);
    }catch(error) {
        console.error('PUT budgets error:', error);
        res.status(500).json({error: 'Erreur serveur'});
    }
});

module.exports = router;