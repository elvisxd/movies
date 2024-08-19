import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'admin',
    database: 'moviesdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

const connection = await mysql.createConnection(config)


export class MovieModel{
    static async getAll({ genre}){

        if(genre){
           const lowerCaseGenre = genre.toLowerCase();
              const [genres] = await connection.query(
                'SELECT id, name FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre]
            )
            if(genres.length === 0)  return []

            const [{id}] = genres
            
            return []
        }

        const [movies] = await connection.query(
            'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie;');
       return movies;
    }

    static async getById({id}){
        const [movies] = await connection.query(
            'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?);', [id]
        )
        if(movies.length === 0) return null
        return movies[0]
    }

    static async create({input}){
        
        const {
            genre: genreInput,
            title,
             year,
          director,
           duration,
            poster,
             rate
        } = input;

        const [uuidResult] = await connection.query('SELECT UUID() uuid;')
        const [{uuid}] = uuidResult

    try {   const [result] = await connection.query(
            `INSERT INTO movie (id, title, year, director, duration, poster, rate) 
             VALUES (UUID_TO_BIN(?),?, ?, ?, ?, ?, ?);`,
            [uuid, title, year, director, duration, poster, rate]
        ) } catch (error) {
            // puede enviar informacion sensible al cliente
            //console.error('Error creating a movie', error)
            throw new Error('Error creating a movie') 
            
        }

 return {
     id: uuid,
     genre: genreInput,
     title,
     year,
     director,
     duration,
     poster,
     rate       
    } }

    static async update({id, input}){
        const {
            genre: genreInput,
            title,
             year,
          director,
           duration,
            poster,
             rate
        } = input;

        const [result] = await connection.query(
            `UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? WHERE id = UUID_TO_BIN(?);`,
            [title, year, director, duration, poster, rate, id]
        )
        if(result.affectedRows === 0) return null
        return {
            id,
            genre: genreInput,
            title,
            year,
            director,
            duration,
            poster,
            rate
        }
    }

    static async delete({id}){
        const [result] = await connection.query(
            'DELETE FROM movie WHERE id = UUID_TO_BIN(?);', [id]
        )
        return result.affectedRows !== 0
    }


}