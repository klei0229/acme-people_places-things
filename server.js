const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_people_places_things', {logging:false});

const {STRING} = Sequelize

const express = require('express');
const app = express();

const data = {
    people: ['moe', 'larry', 'lucy', 'ethyl'],
    places: ['paris', 'nyc', 'chicago', 'london'],
    things: ['hat', 'bag', 'shirt', 'cup']
  };

const Person = db.define('person',{
    name:{
        type: STRING
    }
});  

const Place = db.define('place',{
    name:{
        type: STRING
    }
});  
const Thing = db.define('thing',{
    name:{
        type: STRING
    }
});  

const Souvenir = db.define('souvenir',{
});  

Souvenir.belongsTo(Person);
Souvenir.belongsTo(Place);
Souvenir.belongsTo(Thing);

//routes

app.get("/",async(req,res,next)=>{

    const peopleData = await Person.findAll();
    const placeData = await Place.findAll();
    const thingData = await Thing.findAll();
    const souvenirData = await Souvenir.findAll(
        {include:[Person,Place,Thing]}
    );

    // console.log(souvenirData);

    // console.log(peopleData);
    res.send(`
        <html>
            <body>
                <h1>Acme People, Places and Things</h1>
                <div>
                    <h2>People</h2>
                        <ul>
                            ${peopleData.map((person)=>{
                                return `<li>${person.name}</li>`;
                            }).join("")}
                        </ul>                    
                </div>

                <div>
                    <h2>Places</h2>
                    <ul>
                        ${placeData.map((place)=>{
                            return `<li>${place.name}</li>`;
                        }).join("")}
                    </ul>                    
                </div>

                <div>
                    <h2>Things</h2>
                    <ul>
                        ${thingData.map((thing)=>{
                            return `<li>${thing.name}</li>`;
                        }).join("")}
                    </ul>                    
                </div>
            
                <div>
                <h2>Souvenir Purchases</h2>
                <ul>
                    ${souvenirData.map((souvenir)=>{
                        return `<li>${souvenir.person.name} purchased a ${souvenir.thing.name} in ${souvenir.place.name} </li>`;
                    }).join("")}
                </ul>                    
            </div>

            <form method='POST'>
            <select name='personId'>
              ${
                peopleData.map( person => {
                  return `
                    <option value=${person.id}>
                      ${ person.name }
                    </option>
                  `;
                }).join('')
              }
            </select>
            <select name='placeId'>
              ${
                placeData.map( place => {
                  return `
                    <option value=${place.id}>
                      ${ place.name }
                    </option>
                  `;
                }).join('')
              }
            </select>

            <select name='thingId'>
              ${
                thingData.map( thing => {
                  return `
                    <option value=${thing.id}>
                      ${ thing.name }
                    </option>
                  `;
                }).join('')
              }
            </select>
            <button>Create</button>
          </form>
                
            
            </body>
        </html>
    `);
})



const syncAndSeed = async()=>{
    
    
    // const [moe, larry, lucy, ethyl] = data.people.forEach(async(person)=>{
    //     console.log(person);
    //     return (await Person.create({name:person}));
    // })

    // console.log(moe);

    // data.places.map(async(place)=>{
    //     // console.log(person);
    //     return (await Place.create({name:place}));
    // })

    // data.things.map(async(thing)=>{
    //     // console.log(person);
    //     return (await Thing.create({name:thing}));
    // })

    const [moe,larry,lucy,ethyl] = await Promise.all([
        await Person.create({name:data.people[0]}),
        await Person.create({name:data.people[1]}),
        await Person.create({name:data.people[2]}),
        await Person.create({name:data.people[3]})
    ]);

    const [paris,nyc,chicago,london] = await Promise.all([
        await Place.create({name:data.places[0]}),
        await Place.create({name:data.places[1]}),
        await Place.create({name:data.places[2]}),
        await Place.create({name:data.places[3]})
    ]);

    const [hat,shirt,bag,cup] = await Promise.all([
        await Thing.create({name:data.things[0]}),
        await Thing.create({name:data.things[1]}),
        await Thing.create({name:data.things[2]}),
        await Thing.create({name:data.things[3]})
    ]);


    await Souvenir.create({personId:moe.id, placeId:london.id, thingId:hat.id});
    await Souvenir.create({personId:ethyl.id, placeId:nyc.id, thingId:shirt.id});
    await Souvenir.create({personId:moe.id, placeId:paris.id, thingId:bag.id});
}

const init = async ()=>{
    await db.sync({force:true});
    await syncAndSeed();   

    const PORT = 3000;

    app.listen((PORT),()=>{
        console.log(`listening on port: ${PORT}`);
    })
}

init();