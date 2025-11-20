// Recipe Manager Application
const RecipeManager = {
    // Key for localStorage
    storageKey: 'recipes',
    
    // Initialize the application
    init: function() {
        this.setupEventListeners();
        this.initializeData();
        this.showView('home');
        this.renderRecipeList();
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Navigation
        document.getElementById('nav-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('home');
            this.renderRecipeList();
        });
        document.getElementById('nav-add').addEventListener('click', (e) => {
            e.preventDefault();
            this.showNewRecipeForm();
        });
        
        // Search and filter
        document.getElementById('search-input').addEventListener('input', () => this.renderRecipeList());
        document.getElementById('difficulty-filter').addEventListener('change', () => this.renderRecipeList());
        document.getElementById('time-filter').addEventListener('change', () => this.renderRecipeList());
        
        // Form
        document.getElementById('recipe-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.showView('home');
            this.renderRecipeList();
        });
    },
    
    // Initialize data with sample recipes
    initializeData: function() {
        if (!localStorage.getItem(this.storageKey)) {
            const sampleRecipes = [
                {
                    id: 'classic-dal-rice',
                    title: "Classic Dal & Rice",
                    description: "A comforting and nutritious Indian lentil dish served with fluffy basmati rice.",
                    ingredients: [
                        "1 cup yellow lentils (toor dal)",
                        "1/2 cup basmati rice",
                        "1 onion, finely chopped",
                        "2 tomatoes, chopped",
                        "3 cloves garlic, minced",
                        "1 inch ginger, grated",
                        "1 green chili, slit",
                        "1 tsp turmeric powder",
                        "1 tsp cumin seeds",
                        "1 tsp mustard seeds",
                        "2 tbsp ghee or oil",
                        "Salt to taste",
                        "Fresh coriander for garnish"
                    ],
                    steps: [
                        "Wash lentils and rice separately. Soak rice for 20 minutes.",
                        "Pressure cook lentils with turmeric and 3 cups water for 3 whistles.",
                        "Cook rice with 2 cups water until fluffy.",
                        "Heat ghee in a pan, add cumin and mustard seeds.",
                        "Add onions and sauté until golden brown.",
                        "Add ginger, garlic, green chili and cook for 1 minute.",
                        "Add tomatoes and cook until soft.",
                        "Mash the cooked lentils and add to the pan.",
                        "Simmer for 10 minutes, adjust consistency with water.",
                        "Serve hot with rice, garnished with coriander."
                    ],
                    prepTime: 15,
                    cookTime: 30,
                    difficulty: "easy",
                    imageUrl: "https://cdn.indiaphile.info/wp-content/uploads/2023/02/stp-dal-chawal-7685.jpg?width=1600&crop_gravity=center&aspect_ratio=auto&q=75"
                },
                {
                    id: 'violet-velvet-cake',
                    title: "Violet Velvet Cake",
                    description: "A stunning purple velvet cake with cream cheese frosting.",
                    ingredients: [
                        "2 ½ cups all-purpose flour",
                        "1 ½ cups granulated sugar",
                        "1 tsp baking soda",
                        "1 tsp salt",
                        "1 tbsp cocoa powder",
                        "1 ½ cups vegetable oil",
                        "1 cup buttermilk",
                        "2 large eggs",
                        "2 tbsp violet food coloring",
                        "1 tsp white vinegar",
                        "1 tsp vanilla extract"
                    ],
                    steps: [
                        "Preheat oven to 350°F (175°C). Grease and flour three 8-inch round cake pans.",
                        "In a large bowl, whisk together flour, sugar, baking soda, salt, and cocoa powder.",
                        "In another bowl, mix oil, buttermilk, eggs, food coloring, vinegar, and vanilla.",
                        "Combine wet and dry ingredients, mixing until just combined.",
                        "Divide batter evenly among prepared pans.",
                        "Bake for 25-30 minutes or until a toothpick comes out clean.",
                        "Cool in pans for 10 minutes, then remove to wire racks to cool completely.",
                        "Frost with cream cheese frosting and decorate with edible violets."
                    ],
                    prepTime: 30,
                    cookTime: 30,
                    difficulty: "medium",
                    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                },
                {
                    id: 'midnight-pasta',
                    title: "Midnight Pasta",
                    description: "Elegant black squid ink pasta with seafood in garlic white wine sauce.",
                    ingredients: [
                        "400g squid ink pasta",
                        "200g mixed seafood (shrimp, scallops, calamari)",
                        "4 cloves garlic, thinly sliced",
                        "1/2 cup white wine",
                        "1/4 cup olive oil",
                        "1 lemon, juiced and zested",
                        "Fresh parsley, chopped",
                        "Red pepper flakes",
                        "Salt and black pepper to taste"
                    ],
                    steps: [
                        "Cook pasta in salted water according to package directions.",
                        "While pasta cooks, heat olive oil in a large pan over medium heat.",
                        "Add garlic and red pepper flakes, cook until fragrant.",
                        "Add seafood and cook until just opaque.",
                        "Pour in white wine and lemon juice, simmer for 2 minutes.",
                        "Drain pasta, reserving 1/2 cup pasta water.",
                        "Add pasta to the pan with seafood sauce, toss to combine.",
                        "Add pasta water as needed to create a silky sauce.",
                        "Stir in lemon zest and parsley, season with salt and pepper.",
                        "Serve immediately with extra parsley and lemon wedges."
                    ],
                    prepTime: 15,
                    cookTime: 15,
                    difficulty: "medium",
                    imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                }
            ];
            
            this.saveRecipes(sampleRecipes);
            console.log('Sample recipes initialized');
        }
        
        // Clean up any corrupted data
        this.cleanupData();
    },
    
    // Clean up corrupted data
    cleanupData: function() {
        const recipes = this.getRecipes();
        const validRecipes = recipes.filter(recipe => 
            recipe && 
            recipe.id && 
            recipe.title && 
            typeof recipe.prepTime === 'number' && 
            typeof recipe.cookTime === 'number'
        );
        
        if (validRecipes.length !== recipes.length) {
            console.log('Cleaned up corrupted recipes');
            this.saveRecipes(validRecipes);
        }
    },
    
    // Generate a unique ID for recipes
    generateId: function() {
        return 'recipe-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Get all recipes from localStorage
    getRecipes: function() {
        try {
            const recipes = localStorage.getItem(this.storageKey);
            if (!recipes) return [];
            
            const parsed = JSON.parse(recipes);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            this.showNotification('Error loading recipes', 'error');
            return [];
        }
    },
    
    // Save recipes to localStorage
    saveRecipes: function(recipes) {
        try {
            // Ensure all recipes have valid data
            const validRecipes = recipes.map(recipe => ({
                id: recipe.id || this.generateId(),
                title: recipe.title || 'Untitled Recipe',
                description: recipe.description || '',
                ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
                steps: Array.isArray(recipe.steps) ? recipe.steps : [],
                prepTime: typeof recipe.prepTime === 'number' ? recipe.prepTime : 0,
                cookTime: typeof recipe.cookTime === 'number' ? recipe.cookTime : 0,
                difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) ? recipe.difficulty : 'easy',
                imageUrl: recipe.imageUrl || ''
            }));
            
            localStorage.setItem(this.storageKey, JSON.stringify(validRecipes));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving recipe', 'error');
            return false;
        }
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-color)' : 
                        type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Show a specific view
    showView: function(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected view
        if (viewName === 'home') {
            document.getElementById('home-view').style.display = 'block';
            document.getElementById('nav-home').classList.add('active');
        } else if (viewName === 'detail') {
            document.getElementById('detail-view').style.display = 'block';
        } else if (viewName === 'form') {
            document.getElementById('form-view').style.display = 'block';
            document.getElementById('nav-add').classList.add('active');
        }
    },
    
    // Render the recipe list
    renderRecipeList: function() {
        const recipeList = document.getElementById('recipe-list');
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        const timeFilter = parseInt(document.getElementById('time-filter').value);
        
        const recipes = this.getRecipes();
        
        // Filter recipes
        const filteredRecipes = recipes.filter(recipe => {
            if (!recipe || !recipe.title) return false;
            
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) || 
                                 (recipe.description && recipe.description.toLowerCase().includes(searchTerm));
            const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
            const matchesTime = timeFilter === 0 || totalTime <= timeFilter;
            
            return matchesSearch && matchesDifficulty && matchesTime;
        });
        
        // Clear the list
        recipeList.innerHTML = '';
        
        if (filteredRecipes.length === 0) {
            recipeList.innerHTML = `
                <div class="empty-state">
                    <h2>No recipes found</h2>
                    <p>Try adjusting your search or add a new recipe.</p>
                    <button class="btn btn-primary" id="add-first-recipe">Add Your First Recipe</button>
                </div>
            `;
            
            document.getElementById('add-first-recipe')?.addEventListener('click', () => {
                this.showNewRecipeForm();
            });
            return;
        }
        
        // Render recipe cards
        filteredRecipes.forEach(recipe => {
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                ${recipe.imageUrl ? `
                    <img src="${recipe.imageUrl}" alt="${recipe.title}" class="card-img"
                         onerror="this.style.display='none'">
                ` : ''}
                <div class="card-content">
                    <h3 class="card-title">${recipe.title}</h3>
                    <div class="card-meta">
                        <span>${totalTime} min</span>
                        <span class="difficulty difficulty-${recipe.difficulty || 'easy'}">
                            ${(recipe.difficulty || 'easy').charAt(0).toUpperCase() + (recipe.difficulty || 'easy').slice(1)}
                        </span>
                    </div>
                    <p>${recipe.description || ''}</p>
                    <button class="btn btn-primary view-recipe" data-id="${recipe.id}">View Recipe</button>
                </div>
            `;
            
            recipeList.appendChild(card);
        });
        
        // Add event listeners to view buttons
        this.attachRecipeEventListeners();
    },
    
    // Attach event listeners to recipe cards
    attachRecipeEventListeners: function() {
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                if (recipeId) {
                    this.showRecipeDetail(recipeId);
                }
            });
        });
    },
    
    // Show recipe detail view
    showRecipeDetail: function(recipeId) {
        const recipes = this.getRecipes();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            this.showNotification('Recipe not found', 'error');
            return;
        }
        
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        
        const recipeDetail = document.getElementById('recipe-detail');
        recipeDetail.innerHTML = `
            <div class="recipe-header">
                ${recipe.imageUrl ? `
                    <img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image"
                         onerror="this.style.display='none'">
                ` : ''}
            </div>
            <div class="recipe-info">
                <h1 class="recipe-title">${recipe.title}</h1>
                <p>${recipe.description || ''}</p>
                
                <div class="recipe-meta">
                    <div class="meta-item">
                        <span class="meta-label">Prep Time</span>
                        <span class="meta-value">${recipe.prepTime || 0} min</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Cook Time</span>
                        <span class="meta-value">${recipe.cookTime || 0} min</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Total Time</span>
                        <span class="meta-value">${totalTime} min</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Difficulty</span>
                        <span class="difficulty difficulty-${recipe.difficulty || 'easy'}">
                            ${(recipe.difficulty || 'easy').charAt(0).toUpperCase() + (recipe.difficulty || 'easy').slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h2 class="section-title">Ingredients</h2>
                    <ul class="ingredients-list">
                        ${(recipe.ingredients || []).map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h2 class="section-title">Steps</h2>
                    <ol class="steps-list">
                        ${(recipe.steps || []).map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="edit-recipe" data-id="${recipe.id}">Edit Recipe</button>
                    <button class="btn btn-danger" id="delete-recipe" data-id="${recipe.id}">Delete Recipe</button>
                    <button class="btn btn-secondary" id="back-to-list">Back to List</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('edit-recipe').addEventListener('click', (e) => {
            this.showEditRecipeForm(e.target.getAttribute('data-id'));
        });
        
        document.getElementById('delete-recipe').addEventListener('click', (e) => {
            this.deleteRecipe(e.target.getAttribute('data-id'));
        });
        
        document.getElementById('back-to-list').addEventListener('click', () => {
            this.showView('home');
            this.renderRecipeList();
        });
        
        this.showView('detail');
    },
    
    // Show form for adding a new recipe
    showNewRecipeForm: function() {
        document.getElementById('form-title').textContent = 'Add New Recipe';
        document.getElementById('recipe-form').reset();
        document.getElementById('recipe-id').value = '';
        this.showView('form');
    },
    
    // Show form for editing an existing recipe
    showEditRecipeForm: function(recipeId) {
        const recipes = this.getRecipes();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            this.showNotification('Recipe not found', 'error');
            return;
        }
        
        document.getElementById('form-title').textContent = 'Edit Recipe';
        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('title').value = recipe.title;
        document.getElementById('description').value = recipe.description || '';
        document.getElementById('ingredients').value = (recipe.ingredients || []).join('\n');
        document.getElementById('steps').value = (recipe.steps || []).join('\n');
        document.getElementById('prep-time').value = recipe.prepTime || 0;
        document.getElementById('cook-time').value = recipe.cookTime || 0;
        document.getElementById('difficulty').value = recipe.difficulty || 'easy';
        document.getElementById('image-url').value = recipe.imageUrl || '';
        
        this.showView('form');
    },
    
    // Handle form submission
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        // Basic validation
        const title = document.getElementById('title').value.trim();
        if (!title) {
            this.showNotification('Please enter a recipe title', 'error');
            return;
        }
        
        const recipeData = {
            id: document.getElementById('recipe-id').value || this.generateId(),
            title: title,
            description: document.getElementById('description').value.trim(),
            ingredients: document.getElementById('ingredients').value.split('\n').filter(line => line.trim()),
            steps: document.getElementById('steps').value.split('\n').filter(line => line.trim()),
            prepTime: parseInt(document.getElementById('prep-time').value) || 0,
            cookTime: parseInt(document.getElementById('cook-time').value) || 0,
            difficulty: document.getElementById('difficulty').value || 'easy',
            imageUrl: document.getElementById('image-url').value.trim()
        };
        
        const recipes = this.getRecipes();
        const existingIndex = recipes.findIndex(r => r.id === recipeData.id);
        
        if (existingIndex !== -1) {
            recipes[existingIndex] = recipeData;
        } else {
            recipes.push(recipeData);
        }
        
        if (this.saveRecipes(recipes)) {
            this.showNotification(`Recipe "${recipeData.title}" saved successfully!`, 'success');
            this.showView('home');
            this.renderRecipeList();
        }
    },
    
    // Delete a recipe
    deleteRecipe: function(recipeId) {
        if (!confirm('Are you sure you want to delete this recipe?')) {
            return;
        }
        
        const recipes = this.getRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        
        if (recipeIndex === -1) {
            this.showNotification('Recipe not found', 'error');
            return;
        }
        
        const recipeTitle = recipes[recipeIndex].title;
        recipes.splice(recipeIndex, 1);
        
        if (this.saveRecipes(recipes)) {
            this.showNotification(`Recipe "${recipeTitle}" deleted successfully!`, 'success');
            this.showView('home');
            this.renderRecipeList();
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    RecipeManager.init();
});