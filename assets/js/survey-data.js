// Helper functions extracted from original survey.html
// Function to extract base name from filename (removes extension and certain prefixes)
function extractBaseName(filename) {
  // Remove file extension
  let baseName = filename.replace(/\.[^/.]+$/, "");
  
  // Remove very long descriptive prefixes (common in AI-generated filenames)
  baseName = baseName.replace(/^32_by_32_pixel_art_of_[^-]*-removebg-preview/, ""); // Remove AI-generated prefixes
  baseName = baseName.replace(/^\d{10,}[-_]?/, ""); // Remove timestamp prefixes
  
  // Remove common prefixes/patterns that might interfere with matching
  baseName = baseName.replace(/^\d+[-_]/, ""); // Remove leading numbers with dash/underscore
  baseName = baseName.replace(/^asset_\d+\s*\(\d+\)[-_]?/, ""); // Remove asset_(number)(number) patterns
  baseName = baseName.replace(/^rotated_image\s*\(\d+\)[-_]?/, ""); // Remove rotated_image patterns
  baseName = baseName.replace(/^cut_\d+[-_]?/, ""); // Remove cut_ patterns
  baseName = baseName.replace(/[-_]?removebg[-_]?preview[-_]?/, ""); // Remove removebg-preview patterns
  baseName = baseName.replace(/[-_]?cleaned[-_]?/, ""); // Remove cleaned patterns
  baseName = baseName.replace(/[-_]?centered[-_]?/, ""); // Remove centered patterns
  
  // Clean up remaining patterns and normalize
  baseName = baseName.replace(/[-_]+/g, "_"); // Normalize separators to underscores
  baseName = baseName.replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
  
  // If the result is empty or still very long/complex, try to extract meaningful parts
  if (!baseName || baseName.length > 50) {
    // Try to extract from the end of the original filename (often the actual item name)
    const parts = filename.replace(/\.[^/.]+$/, "").split(/[-_]/);
    if (parts.length > 1) {
      // Take the last few meaningful parts
      const meaningfulParts = parts.slice(-2).filter(part => 
        part.length > 2 && 
        !part.match(/^\d+$/) && 
        !part.match(/^(removebg|preview|cleaned|centered)$/)
      );
      if (meaningfulParts.length > 0) {
        baseName = meaningfulParts.join("_");
      }
    }
  }
  
  return baseName;
}

// Calculate exact similarity score between filename and database key
function calculateExactMatchScore(baseName, key) {
  const normalizedBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Exact match gets highest score
  if (normalizedBase === normalizedKey) {
    return 1.0;
  }
  
  // Also check with spaces converted to underscores and vice versa
  const baseWithUnderscore = baseName.toLowerCase().replace(/\s+/g, "_");
  const keyWithSpace = key.toLowerCase().replace(/_/g, " ");
  
  if (baseWithUnderscore === key.toLowerCase() || baseName.toLowerCase() === keyWithSpace) {
    return 1.0;
  }
  
  // For very precise matching, require exact word order and content
  const baseWords = baseName.toLowerCase().split(/[_\s-]+/).filter(w => w.length > 0);
  const keyWords = key.toLowerCase().split(/[_\s-]+/).filter(w => w.length > 0);
  
  if (baseWords.length === 0 || keyWords.length === 0) {
    return 0;
  }
  
  // Count exact matching words in exact order
  let exactMatches = 0;
  let maxLength = Math.max(baseWords.length, keyWords.length);
  
  for (let i = 0; i < Math.min(baseWords.length, keyWords.length); i++) {
    if (baseWords[i] === keyWords[i]) {
      exactMatches++;
    }
  }
  
  // Calculate score based on exact word matches in order
  const orderScore = exactMatches / maxLength;
  
  // Only return high scores for very close matches
  return orderScore;
}

// Function to find matching description from descriptionsDatabase
function findMatchingDescription(filename) {
  const baseName = extractBaseName(filename);
  
  // Direct exact match first - this should be the primary method
  if (descriptionsDatabase && descriptionsDatabase[baseName]) {
    return {
      name: baseName.replace(/_/g, " "), // Convert underscores to spaces for display
      description: descriptionsDatabase[baseName]
    };
  }
  
  // Try exact match with original filename (without extension)
  const originalBase = filename.replace(/\.[^/.]+$/, "");
  if (descriptionsDatabase && descriptionsDatabase[originalBase]) {
    return {
      name: originalBase.replace(/_/g, " "),
      description: descriptionsDatabase[originalBase]
    };
  }
  
  // Try case variations only for exact matches
  const exactVariations = [
    baseName.toLowerCase(),
    baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase(),
    baseName.replace(/_/g, " "),
    baseName.replace(/_/g, " ").toLowerCase(),
    baseName.replace(/_/g, " ").charAt(0).toUpperCase() + baseName.replace(/_/g, " ").slice(1).toLowerCase(),
    originalBase,
    originalBase.toLowerCase(),
    originalBase.charAt(0).toUpperCase() + originalBase.slice(1).toLowerCase()
  ];
  
  for (const variation of exactVariations) {
    if (descriptionsDatabase && descriptionsDatabase[variation]) {
      return {
        name: variation.replace(/_/g, " "),
        description: descriptionsDatabase[variation]
      };
    }
  }
  
  // Only use partial matching if no exact match found and score is very high (98%+)
  let bestMatch = null;
  let bestScore = 0;
  
  if (descriptionsDatabase) {
    for (const [key, description] of Object.entries(descriptionsDatabase)) {
      const score = calculateExactMatchScore(baseName, key);
      if (score > bestScore && score >= 0.98) { // Very high threshold for partial matches
        bestScore = score;
        bestMatch = {
          name: key.replace(/_/g, " "),
          description: description
        };
      }
    }
  }
  
  // Return partial match only if score is very high
  if (bestMatch && bestScore >= 0.98) {
    return bestMatch;
  }
  
  // No match found - return empty instead of defaulting to anything
  return {
    name: '',
    description: ''
  };
}

// Image database - organized by folder structure (extracted from original survey.html)
const imageDatabase = {
  "Game pixel art": {
    images: ["Untitled-cleaned.png"],
    subfolders: {
      "Armor": {
        images: [],
        subfolders: {
          "Body armor - armor": {
            images: [
              "1740640300970-removebg-preview.png",
              "1740640679583-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_12-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_17-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_3-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_7-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_8-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__1__2-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__1__5-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__11-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__12-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__13-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__2-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__21-removebg-preview-cleaned.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__3-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__6-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__8-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__8-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc._in_ancient_Israelite_style.png__1__4-removebg-preview.png",
              "Leather armor.png",
              "outlined-image (11).png",
              "outlined-image (2).png",
              "outlined-image (3).png",
              "outlined-image (6).png",
              "women's gold armor.png"
            ]
          },
          "helmets - armor": {
            images: [
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_13-removebg-preview-cleaned.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_14-removebg-preview (1).png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_15-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_16-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_18-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_19-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__1__8-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__1__9-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__2__4-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__2-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__3-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__4-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__5-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__6-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png__3__7-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc._in_ancient_Israelite_style.png__1__2-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc._in_ancient_Israelite_style.png__1__3-removebg-preview.png",
              "Golden helm.png",
              "Philistine Helm.png",
              "soldier's gold helmet.png"
            ]
          },
          "shields - armor": {
            images: [
              "1740044691909-removebg-preview.png",
              "1740044700568-removebg-preview.png",
              "1740102860965-removebg-preview.png",
              "1740103205801-removebg-preview.png",
              "1740104230242-removebg-preview.png",
              "1740106704928-removebg-preview.png",
              "1740106789051-removebg-preview.png",
              "1740106803164-removebg-preview.png",
              "1740106817066-removebg-preview.png",
              "1740106830940-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_10-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_11-removebg-preview.png",
              "32_by_32_pixel_art_of_different_armor_pieces_in_leather__copper__bronze__iron__etc.__in_an_ancient_Israelite_style.png_9-removebg-preview.png",
              "32_by_32_pixel_art_of_shaul__a_rod__a_staff__a_horn__a_coat_of_many_colors__a_torch__a_flaming_sword__a_candleabra__and_different_armor_pieces_in_leather__copper__bronze__iron__etc._in_ancient_Israeli (1).png",
              "Gold rimmed shield.png",
              "King's shield.png",
              "Spear man's shield.png",
              "asset_1 (45)-cleaned.png",
              "quality wooden shield.png"
            ]
          }
        }
      },
      "Equipables": {
        images: [
          "asset_14-cleaned_centered.png",
          "Fishing rod (2).png",
          "rotated_image (10).png",
          "rotated_image (11).png",
          "rotated_image (14).png",
          "rotated_image (15).png",
          "rotated_image (16).png",
          "rotated_image (17).png",
          "rotated_image (18).png",
          "rotated_image (19).png",
          "rotated_image (20).png"
        ]
      },
      "clothing": {
        images: [
          "Green cloak.png",
          "outlined-image (10).png",
          "outlined-image (7).png",
          "outlined-image (8).png",
          "outlined-image (9).png",
          "Red cloak.png"
        ]
      },
      "Collectibles": {
        images: [],
        subfolders: {
          "assorted": {
            images: [
              "1740104286089-removebg-preview-cleaned.png",
              "1740104886409-removebg-preview.png",
              "1740105313697-removebg-preview.png",
              "1740107414582-removebg-preview.png",
              "Ancient_Bracelet.png",
              "Ancient_Fish_Hook.png",
              "Ancient_Flying_Toy.png",
              "Ancient_Necklace.png",
              "Broken_Blade.png",
              "Broken_Bracelet.png",
              "Crescent earrings.png",
              "Golden_Tag.png",
              "Scroll.png",
              "Shattered_Blade.png",
              "Spoon.png",
              "asset_10 (1)-cleaned.png",
              "asset_10 (3)-cleaned.png",
              "asset_10 (5)-cleaned.png",
              "asset_4 (22).png",
              "asset_5 (14).png",
              "asset_5 (19)-cleaned.png",
              "asset_5 (21)-cleaned.png",
              "asset_6 (17)-cleaned.png",
              "asset_7 (24).png",
              "bronze-chain with tag.png",
              "decorative clay statue of a bird.png",
              "feathered decor.png",
              "flower decor.png",
              "golden decor.png",
              "small_assorted_statue.png",
              "stone decor.png"
            ]
          },
          "Assyrian": {
            images: [
              "Ancient art.png",
              "Ancient severed head with inscription.png",
              "Assyrian_Art.png",
              "Assyrian_stone_Marker.png",
              "Assyrian_Whip_Handle.png",
              "Decorative_Assyrian_Challace.png",
              "Rock with inscription.png",
              "Stone statue of Assyrian fish god.png",
              "Stone                    with                    inscription.png",
              "Stone of Assyrian fish god.png",
              "Stone_Art.png",
              "Stone_Assyrian_Fish_God_Carving.png",
              "Stone_tablet from Syria.png",
              "Stone_with_inscription_2.png",
              "Stone_with_inscription.png",
              "Tall_assyrian_vase.png",
              "The Ancient Deity_- Dagon.png",
              "The_fiery_Pheonix.png",
              "Vase.png",
              "assryian decor.png",
              "stone_art.png",
              "stone_art_2.png",
              "stone_extract_with_scene.png",
              "stone_scroll.png",
              "stone_slab with instructions.png",
              "stone_tablet_1.png",
              "stone_tablet_2.png",
              "stone_with_people.png",
              "stone_with_people__sym_.png"
            ]
          },
          "Canaanitish": {
            images: [
              "Head_of_Baal.png",
              "statue_of_philistine_deity.png"
            ]
          },
          "Egyptian": {
            images: [
              "An embalming oil.png",
              "Ancient_Egyptian_Earrings.png",
              "Ankh.png",
              "Egyptian_Brooch.png",
              "Egyptian_Compass.png",
              "Egyptian_Decorative_Pot.png",
              "Egyptian_Decorative_Water_Pitcher.png",
              "Egyptian_Embalming_Jar.png",
              "Egyptian_Embalming_oil.png",
              "Egyptian_Oil_Pot.png",
              "Egyptian_Pendant.png",
              "Egyptian_Pitcher.png",
              "Egyptian_Pot.png",
              "Egyptian_Scalpal.png",
              "Egyptian_Sceptre.png",
              "Egyptian_Teapot.png",
              "Egyptian_Urn.png",
              "Egyptian_Water_Jug.png",
              "Khokha.png",
              "Large_Egyptian_Pot.png",
              "wheel of time.png"
            ],
            subfolders: {
              "egyptian decor": {
                images: [
                  "Decorative egyptian vase.png",
                  "Decorative_Egyptian_Jar.png",
                  "Decorative_jar.png",
                  "Egyptian_Oil_Jar.png",
                  "Egyptian_Oil_Jar_pyramid_template.png",
                  "Inscribed egyptian vase.png",
                  "Intricate egyptian vase.png",
                  "Nile Jar.png",
                  "Plain egyptian vase.png",
                  "Small Egyptian vase.png",
                  "very tall egyptian vase.png"
                ]
              }
            }
          },
          "Israeli": {
            images: [
              "Ancient_Hebrew_Dradle.png",
              "Ancient_Hebrew_Necklace.png",
              "Ancient_Hebrew_RIng.png",
              "Ancient_Hebrew_Ring.png",
              "Ancient_Hebrew_Spoon.png",
              "Ancient_Israeli_Bracelet.png",
              "Ancient_Scroll.png",
              "Ancient_tablet_map.png",
              "Hebrew_Archive_Container.png",
              "Hebrew_Challace.png",
              "Hebrew_Mortar_and_Pestel.png",
              "Hebrew_Oil_Jar.png",
              "Hebrew_Oil_Lamp.png",
              "Hebrew_Plate.png",
              "Hebrew_Pot.png",
              "Hebrew_Smoking_Pot.png",
              "Hebrew_Urn.png",
              "Hebrew_Vase.png",
              "Hebrew_Water_Bason.png",
              "Hebrew_Water_Pitcher.png",
              "Hebrew_Water_Pot.png",
              "Israeli_pot.png",
              "Israeli_Stone_Marker_.png",
              "Scroll_Basket.png"
            ]
          },
          "tablets": {
            images: [],
            subfolders: {
              "Old man collection": {
                images: [
                  "Tablet_1.png",
                  "Tablet_12.png",
                  "Tablet_13.png",
                  "Tablet_16.png",
                  "Tablet_19.png",
                  "Tablet_3.png",
                  "Tablet_5.png",
                  "Tablet_6.png",
                  "tablet_10.png",
                  "tablet_11.png",
                  "tablet_14.png",
                  "tablet_15.png",
                  "tablet_20.png",
                  "tablet_4 (1).png",
                  "tablet_4.png",
                  "tablet_7.png",
                  "tablet_8.png",
                  "tablet_9.png",
                  "tablets_17 _ 18 (1).png",
                  "tablets_17 _ 18.png"
                ]
              }
            }
          }
        }
      },
      "food decor": {
        images: [
          "decor for food market fruit and vegitables.png",
          "food market fast food decor.png",
          "food market fruit and vegitable decor.png",
          "various snacks.png"
        ]
      },
      "Foods": {
        images: [
          "Almonds.png",
          "Appetizer.png",
          "Apricots.png",
          "Avacadoes.png",
          "Basket_of_red_plums.png",
          "Basket_of_stones.png",
          "Bean_Stew.png",
          "Beat_Soup.png",
          "Beef_and_Veggies.png",
          "Beef_and_beans.png",
          "Beef_stew.png",
          "Beet_Salad.png",
          "Berries.png",
          "Bowl_of_Red_Plums.png",
          "Box_of_Dates.png",
          "Box_of_almonds.png",
          "Bread.png",
          "Broccoli.png",
          "Butter.png",
          "Carrots.png",
          "Cheese.png",
          "Chestnuts.png",
          "Chicken_Broth.png",
          "Chicken_stew.png",
          "COncord_Grapes.png",
          "Cooked_Goat.png",
          "Crushed_Meal.png",
          "Eggs.png",
          "Fig.png",
          "Fried_Meat.png",
          "Fried_Potatoes.png",
          "Fried_Vegetables.png",
          "Garlic.png",
          "Goat_Butter.png",
          "Goat_Cheese.png",
          "Gorbonzo_Beans.png",
          "Grits_and_Beef.png",
          "Herbal_Elixir.png",
          "Herbal_tea.png",
          "Honey_Wafers.png",
          "Jar_of_Honey.png",
          "Jar_of_red_plums.png",
          "Kidney_Bean_Bushel.png",
          "Lamb_stew.png",
          "Lavendar_sprigs.png",
          "Mandarines.png",
          "Mashed_Potatoes.png",
          "Matza.png",
          "Meal_and_herbs.png",
          "Medicine_Vile.png",
          "Medicinal_Tartar.png",
          "Milk_Bottle.png",
          "Myrh.png",
          "Oatmeal.png",
          "Olive_Oil.png",
          "Onion.png",
          "Pear.png",
          "Pinto_Beans.png",
          "Pita_in_stew.png",
          "Pitcher_of_Water.png",
          "Plain_Wafers.png",
          "Pluot.png",
          "Pomegranate.png",
          "Pomegranate_half.png",
          "Pomegranates.png",
          "Porridge.png",
          "Potatoes.png",
          "Purple_Fig.png",
          "Purple_Plums.png",
          "Red_Grapes.png",
          "Red_Pottage.png",
          "Sage.png",
          "Shallot.png",
          "Shew_Bread.png",
          "Smooth_Stones.png",
          "Sun_Shell.png",
          "Table_grapes.png"
        ],
        subfolders: {
          "drinks": {
            images: [
              "Barley_Brew.png",
              "Pitcher_of_water.png"
            ]
          },
          "Farming products": {
            images: [
              "Bushel_of_Grain.png",
              "Seed_Oil_Flask.png",
              "bread grains.png",
              "standard grain bag.png"
            ]
          },
          "fish": {
            images: [
              "Fish_1.png",
              "Fish_2.png",
              "Mackeral.png",
              "Night_fish.png",
              "Rainbow_Runner.png",
              "clown_fish.png",
              "gold_fish.png",
              "ocean_sunfish.png",
              "seaweed.png",
              "shrimp.png"
            ]
          },
          "ingredients": {
            images: [],
            subfolders: {
              "addatives": {
                images: [
                  "butter_pinwheel.png",
                  "sugar and space mix.png",
                  "sugar.png"
                ]
              },
              "fruits": {
                images: [
                  "Apple.png",
                  "Black_Beauty_Plums.png",
                  "Cranberry_Basket.png",
                  "Pear.png"
                ]
              },
              "grains": {
                images: [
                  "Barley.png"
                ]
              },
              "herbs": {
                images: [
                  "Lavendar_sprigs.png",
                  "Sage.png"
                ]
              },
              "nuts": {
                images: [
                  "Container_of_Hazelnuts.png"
                ]
              },
              "vegetables": {
                images: [
                  "Beet.png",
                  "Onion.png",
                  "carrot.png",
                  "green pepper.png",
                  "radish.png",
                  "yellow pepper.png"
                ],
                subfolders: {
                  "finished plant cycles": {
                    images: [
                      "bean plant.png",
                      "carrot plant.png",
                      "cauliflower plant.png",
                      "eggplant plant.png",
                      "garlic plant.png",
                      "green beans plant.png",
                      "green pepper plant.png",
                      "lettuce plant.png",
                      "onion plant.png",
                      "potatoe plant.png",
                      "radish plant.png",
                      "tomatoe plant.png",
                      "watermelon plant.png",
                      "wheat plant.png",
                      "yellow pepper plant.png"
                    ]
                  }
                }
              }
            }
          }
        }
      },
      "footwear": {
        images: [],
        subfolders: {
          "foot bindings": {
            images: [
              "Basic_gold_sandals.png",
              "decorative gold sandels.png",
              "decorative goldsandals.png",
              "royal sandals.png",
              "unique sandals.png"
            ]
          },
          "sandals": {
            images: [
              "beautiful sandals.png",
              "common sandals.png",
              "highly decorative sandals.png",
              "leather sandals.png",
              "silver sandals.png"
            ]
          }
        }
      },
      "furniture": {
        images: [],
        subfolders: {
          "bookcase": {
            images: [
              "decorative bookshelf.png",
              "plain bookshelf.png",
              "small bookshelf.png"
            ]
          },
          "cabinets": {
            images: [
              "Small decorative cabinet.png",
              "decorative cabinet.png",
              "highly decorative cabinet.png"
            ]
          },
          "chairs": {
            images: [
              "decorative chair.png",
              "small chair.png"
            ]
          },
          "chests": {
            images: [
              "decorative box.png",
              "decorative chest with srolls.png",
              "decorative chest.png",
              "decorative_storage_box.png",
              "intricate jewlery case.png"
            ]
          },
          "decorations": {
            images: [],
            subfolders: {
              "On Floor": {
                images: [
                  "Decorative fan.png",
                  "Simple decor.png",
                  "decoratively styled oil lamp.png",
                  "floor decor copy.png",
                  "floor decor.png"
                ]
              },
              "On Table": {
                images: [
                  "Decorative candle holder.png",
                  "Decorative pottery.png",
                  "Tall candle stick.png",
                  "decorative table decor.png"
                ]
              },
              "On Wall": {
                images: [
                  "beautiful wall decor.png",
                  "decorative wall decor.png",
                  "fabric wall decor.png"
                ]
              }
            }
          },
          "stalls": {
            images: [
              "milk stand.png",
              "produce stand.png"
            ]
          },
          "tabernacle": {
            images: [
              "Tabernacle.png"
            ],
            subfolders: {
              "1740045029245-removebg-preview.png - Shortcut.lnk": {
                images: []
              }
            }
          },
          "tables": {
            images: [
              "Small table.png",
              "small writing table.png",
              "table with oil lamps.png"
            ]
          }
        }
      },
      "gems or jewelry": {
        images: [],
        subfolders: {
          "gems": {
            images: [
              "Amazonite.png",
              "Amber.png",
              "Amethyst.png",
              "Aquamarine.png",
              "Beryl_Pendant.png",
              "Diamond_Pendant.png",
              "Emerald.png",
              "Golden_Chain_of_Assyrian_King.png",
              "Lapiz_Lazuli_Pendant.png",
              "Onyx.png",
              "Opal_Locket.png",
              "Ruby.png",
              "Sapphire.png",
              "Topaz.png",
              "Zircon.png",
              "amber locket.png"
            ]
          },
          "jewelry": {
            images: [],
            subfolders: {
              "Bracelets": {
                images: [
                  "Ancient_Israeli_Bracelet.png",
                  "Plain_Assyrian_Bracelet.png",
                  "ancient bracelet.png",
                  "bracelet.png",
                  "broken bracelet.png"
                ]
              },
              "necklaces": {
                images: [
                  "Ancient_Hebrew_Necklace.png",
                  "decorative necklace.png",
                  "necklace.png"
                ]
              },
              "pendants": {
                images: [
                  "Ancient_Egyptian_Pendant.png",
                  "Israeli crown.png",
                  "Opal locket.png",
                  "decorative pendant.png"
                ]
              },
              "Rings": {
                images: [
                  "Ancient_Hebrew_RIng.png",
                  "Ancient_Hebrew_Ring.png",
                  "Decorative ring.png",
                  "fancy ring.png"
                ]
              }
            }
          }
        }
      },
      "healing items": {
        images: [],
        subfolders: {
          "healing pots": {
            images: [
              "Healing_Elixir.png",
              "Healing_potion_2.png",
              "Herbal_Elixir.png",
              "Remedy.png"
            ]
          },
          "stat upgrads": {
            images: [
              "Antidote_Remedy.png",
              "Remedy.png"
            ]
          }
        }
      },
      "mining items": {
        images: [],
        subfolders: {
          "gems": {
            images: [
              "Amber_locket.png",
              "Beryl_Pendant.png",
              "Diamond_Pendant.png",
              "Emerald.png",
              "Lapiz_Lazuli_Pendant.png",
              "Onyx.png",
              "Opal_Locket.png",
              "Ruby.png",
              "Sapphire.png",
              "Topaz.png",
              "Zircon.png"
            ]
          },
          "ores": {
            images: [
              "Copper.png",
              "Gold.png",
              "Iron.png",
              "Silver.png",
              "Tin.png"
            ]
          },
          "stones": {
            images: [
              "Assyrian_Stone.png",
              "Israeli_Stone.png",
              "Plain stone.png",
              "Stone.png",
              "stone_with inscription.png",
              "stone_with people.png",
              "stone_with_inscription (2).png",
              "stone_with_inscription.png"
            ]
          }
        }
      },
      "outside decor": {
        images: [
          "Beautiful plant.png",
          "Fern potted.png",
          "Flower_plant.png",
          "Flower_pot.png",
          "Purple plant.png",
          "Tree (1).png",
          "Tree (2).png",
          "decorative bush.png",
          "flower pot a.png",
          "flower pot b.png",
          "flower pot c.png",
          "flower pot.png",
          "flower.png",
          "plant pot.png"
        ]
      },
      "Plants": {
        images: [],
        subfolders: {
          "Crop stages": {
            images: [],
            subfolders: {
              "broccoli": {
                images: [
                  "plank growth 6.png"
                ]
              },
              "carrot": {
                images: [
                  "carrot growth 1.png",
                  "carrot growth 2.png",
                  "carrot growth 3.png",
                  "carrot growth 4.png",
                  "carrot growth 5.png",
                  "carrot growth 6.png"
                ]
              },
              "cauliflower": {
                images: [
                  "plant growth 1.png",
                  "plant growth 2.png",
                  "plant growth 3.png",
                  "plant growth 4.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "chili pepper": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "corn": {
                images: [
                  "seedling.png"
                ]
              },
              "cucumber": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "eggplant": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "garlic": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "green beans": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "green pepper": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "horse radish": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "lettuce": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "onion": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png",
                  "plank growth 3.png",
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "plank growth 1": {
                images: [
                  "plank growth 1.png",
                  "plank growth 2.png"
                ]
              },
              "plank growth 2": {
                images: [
                  "plank growth 3.png"
                ]
              },
              "plank growth 3": {
                images: [
                  "plant growth 5.png",
                  "plant growth 6.png"
                ]
              },
              "plant growth 5": {
                images: []
              },
              "plant growth 6": {
                images: []
              },
              "potatoe": {
                images: [
                  "seedling.png"
                ]
              },
              "pumpkin": {
                images: [
                  "seedling.png"
                ]
              },
              "radish": {
                images: [
                  "seedling.png"
                ]
              },
              "red pepper": {
                images: [
                  "seedling.png"
                ]
              },
              "strawberry": {
                images: [
                  "seedling.png"
                ]
              },
              "sweet potatoe": {
                images: [
                  "seedling.png"
                ]
              },
              "tomatoe": {
                images: [
                  "seedling.png"
                ]
              },
              "watermelon": {
                images: [
                  "seedling.png"
                ]
              },
              "wheat": {
                images: [
                  "seedling.png"
                ]
              },
              "yellow pepper": {
                images: [
                  "seedling.png"
                ]
              },
              "zucchini": {
                images: [
                  "seedling.png"
                ]
              }
            }
          },
          "Flower stages": {
            images: [],
            subfolders: {
              "daisies": {
                images: [],
                subfolders: {
                  "pink daisy": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "violet daisy": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "white daisy": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  }
                }
              },
              "irises": {
                images: [],
                subfolders: {
                  "dark blue iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "light blue iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "orange iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "pink iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "purple iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "red iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "violet iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "white iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  },
                  "yellow iris": {
                    images: [
                      "stage 1.png",
                      "stage 2.png",
                      "stage 3.png",
                      "stage 4.png",
                      "stage 5.png",
                      "stage 6.png"
                    ]
                  }
                }
              },
              "lilies": {
                images: [
                  "lily 0.png",
                  "lily 1.png",
                  "lily 2.png",
                  "lily 3.png",
                  "lily 4.png",
                  "lily 5.png"
                ]
              },
              "poppies": {
                images: [
                  "Maroon poppy 0.png",
                  "Maroon poppy 1.png",
                  "Maroon poppy 2.png",
                  "Maroon poppy 3.png",
                  "Orange poppy 0.png",
                  "Orange poppy 1.png",
                  "Orange poppy 2.png",
                  "Orange poppy 3.png",
                  " beautiful violet flower.png",
                  "blue flower.png",
                  "blue flower_2.png",
                  "beautiful violet flower.png",
                  "light orange (apricot) flower.png",
                  "pink flower.png",
                  "purple flower.png",
                  "violet flower.png"
                ]
              },
              "roses": {
                images: [
                  "leafy rose 0.png",
                  "leafy rose 1.png",
                  "leafy rose 2.png",
                  "leafy rose 3.png"
                ]
              },
              "tulips": {
                images: [
                  "tulip 0.png",
                  "tulip 1.png",
                  "tulip 2.png",
                  "tulip 3.png"
                ]
              },
              "wild flowers": {
                images: [
                  "beautiful violet flower.png",
                  "blue flower.png",
                  "blue flower_2.png",
                  "beautiful violet flower.png",
                  "light orange (apricot) flower.png",
                  "pink flower.png",
                  "purple flower.png",
                  "violet flower.png"
                ]
              }
            }
          }
        }
      },
      "Regular items": {
        images: [],
        subfolders: {
          "pouches": {
            images: [
              "decorative yellow purse.png",
              "gold coin purse.png",
              "simple cloth purse.png"
            ]
          },
          "shells": {
            images: [
              "Sea shell.png",
              "Sun Shell.png",
              "decorative shell.png",
              "stone shell.png"
            ]
          }
        }
      },
      "Scrolls": {
        images: [
          "THe_Historical_Scrolls.png",
          "The_Poetry_Scrolls.png",
          "The_Prophetic_Scrolls.png",
          "The_torrah_Basket.png"
        ]
      },
      "Story items": {
        images: [
          "Kings_Orders.png",
          "Pile_of_rope.png",
          "Spoke.png",
          "THe Pharaoh's orders.png",
          "Tent_Spoke.png"
        ]
      },
      "weapons": {
        images: [],
        subfolders: {
          "axes": {
            images: [
              "decorative axe.png",
              "golden axe.png",
              "jagged axe.png",
              "wood and metal axe.png"
            ]
          },
          "bows": {
            images: [
              "Fancy_Bow.png",
              "Philistine Compact Bow.png",
              "Regular_Bow.png",
              "shot bow.png"
            ]
          },
          "knives": {
            images: [
              "Impact_Dagger.png",
              "Jagged_Blade.png",
              "Rappier.png",
              "Slashing_Dagger.png",
              "dagger.png",
              "fancy knife.png",
              "golden hilted dagger.png",
              "sharp knife.png"
            ]
          },
          "other": {
            images: [
              "1740106565216-removebg-preview.png",
              "1740107155766-removebg-preview.png",
              "Assyrian_Swinging_Spear.png",
              "asset_3 (45).png",
              "asset_3-cleaned.png",
              "asset_4 (2)-cleaned.png",
              "asset_4 (40).png",
              "asset_5 (9).png",
              "asset_7 (23).png"
            ]
          },
          "Special weapons": {
            images: [
              "Staff_of_Moses.png",
              "Sword of the Garden.png"
            ]
          },
          "swords": {
            images: [
              "1740103017958-removebg-preview.png",
              "1740106510904-removebg-preview.png",
              "1740106524125-removebg-preview.png",
              "1740107054339-removebg-preview.png",
              "1740107126723-removebg-preview.png",
              "32_by_32_pixel_art_style_inventory_of_jewels__gems__and_ancient_artifacts.png_16-removebg-preview.png"
            ]
          },
          "throwing blades": {
            images: [
              "Carving_Blade.png",
              "Decorative_Throwing_Blade.png",
              "Hunting_dart.png",
              "Throwing_Blade.png",
              "Throwing_Dart.png",
              "asset_5 (15)-cleaned.png",
              "asset_7 (12)-cleaned.png",
              "asset_7 (16)-cleaned.png",
              "throwing dagger.png"
            ]
          }
        }
      }
    }
  }
};
