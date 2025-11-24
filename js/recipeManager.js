
export const RecipeManager = {
    storageKey: 'recipes',
    
    // Initialize the application
    init: function() {
        try {
            this.setupEventListeners();
            this.initializeData();
            this.showView('home');
            this.renderRecipeList();
            console.log('Recipe Manager initialized successfully');
        } catch (error) {
            this.handleCriticalError('Failed to initialize application', error);
        }
    },
    
    // Set up event listeners with error handling
    setupEventListeners: function() {
        try {
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
            
            // Real-time form validation
            this.setupFormValidation();
        } catch (error) {
            this.handleCriticalError('Failed to setup event listeners', error);
        }
    },
    
    // Setup real-time form validation
    setupFormValidation: function() {
        const form = document.getElementById('recipe-form');
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Clear error when user starts typing
                const errorElement = document.getElementById(`${input.id}-error`);
                // Support hours/minutes inputs for prep and cook time: clear and validate proxy field
                const timeFields = ['prep', 'cook'];
                timeFields.forEach(prefix => {
                    const hours = document.getElementById(`${prefix}-hours`);
                    const minutes = document.getElementById(`${prefix}-minutes`);
                    const proxyError = document.getElementById(`${prefix}-time-error`);

                    if (hours) {
                        hours.addEventListener('input', () => {
                            if (proxyError) proxyError.style.display = 'none';
                            hours.style.borderColor = 'rgba(139, 95, 191, 0.2)';
                        });
                        hours.addEventListener('blur', () => this.validateField({ id: `${prefix}-time` }));
                    }
                    if (minutes) {
                        minutes.addEventListener('input', () => {
                            if (proxyError) proxyError.style.display = 'none';
                            minutes.style.borderColor = 'rgba(139, 95, 191, 0.2)';
                        });
                        minutes.addEventListener('blur', () => this.validateField({ id: `${prefix}-time` }));
                    }
                });

                if (errorElement) {
                    errorElement.style.display = 'none';
                    input.style.borderColor = 'rgba(139, 95, 191, 0.2)';
                }
            });
        });
    },
    
    // Validate individual field
    validateField: function(field) {
        try {
            const errorElement = document.getElementById(`${field.id}-error`);
            if (!errorElement) return true;
            
            let isValid = true;
            let errorMessage = '';
            
            switch(field.id) {
                case 'title':
                    if (!field.value.trim()) {
                        errorMessage = 'Recipe title is required';
                        isValid = false;
                    } else if (field.value.trim().length < 2) {
                        errorMessage = 'Title must be at least 2 characters long';
                        isValid = false;
                    } else if (field.value.trim().length > 100) {
                        errorMessage = 'Title must be less than 100 characters';
                        isValid = false;
                    }
                    break;
                    
                case 'description':
                    if (!field.value.trim()) {
                        errorMessage = 'Description is required';
                        isValid = false;
                    } else if (field.value.trim().length < 10) {
                        errorMessage = 'Description must be at least 10 characters long';
                        isValid = false;
                    } else if (field.value.trim().length > 500) {
                        errorMessage = 'Description must be less than 500 characters';
                        isValid = false;
                    }
                    break;
                    
                case 'ingredients':
                    const ingredients = field.value.split('\n').filter(line => line.trim() !== '');
                    if (ingredients.length === 0) {
                        errorMessage = 'At least one ingredient is required';
                        isValid = false;
                    } else if (ingredients.length > 50) {
                        errorMessage = 'Maximum 50 ingredients allowed';
                        isValid = false;
                    } else {
                        // Validate each ingredient
                        for (let ingredient of ingredients) {
                            if (ingredient.length > 200) {
                                errorMessage = 'Each ingredient must be less than 200 characters';
                                isValid = false;
                                break;
                            }
                        }
                    }
                    break;
                    
                case 'steps':
                    const steps = field.value.split('\n').filter(line => line.trim() !== '');
                    if (steps.length === 0) {
                        errorMessage = 'At least one step is required';
                        isValid = false;
                    } else if (steps.length > 100) {
                        errorMessage = 'Maximum 100 steps allowed';
                        isValid = false;
                    } else {
                        // Validate each step
                        for (let step of steps) {
                            if (step.length > 500) {
                                errorMessage = 'Each step must be less than 500 characters';
                                isValid = false;
                                break;
                            }
                        }
                    }
                    break;
                    
                case 'prep-time':
                    // Read from hours/minutes inputs if present
                    const ph = parseInt((document.getElementById('prep-hours') || { value: 0 }).value) || 0;
                    const pm = parseInt((document.getElementById('prep-minutes') || { value: 0 }).value) || 0;
                    const totalPrep = ph * 60 + pm;
                    if (isNaN(totalPrep)) {
                        errorMessage = 'Prep time must be a valid number';
                        isValid = false;
                    } else if (totalPrep <= 0) {
                        errorMessage = 'Prep time must be at least 1 minute';
                        isValid = false;
                    } else if (totalPrep > 1440) {
                        errorMessage = 'Prep time cannot exceed 24 hours (1440 minutes)';
                        isValid = false;
                    }
                    break;
                    
                case 'cook-time':
                    const ch = parseInt((document.getElementById('cook-hours') || { value: 0 }).value) || 0;
                    const cm = parseInt((document.getElementById('cook-minutes') || { value: 0 }).value) || 0;
                    const totalCook = ch * 60 + cm;
                    if (isNaN(totalCook)) {
                        errorMessage = 'Cook time must be a valid number';
                        isValid = false;
                    } else if (totalCook < 0) {
                        errorMessage = 'Cook time cannot be negative';
                        isValid = false;
                    } else if (totalCook > 1440) {
                        errorMessage = 'Cook time cannot exceed 24 hours (1440 minutes)';
                        isValid = false;
                    }
                    break;
                    
                case 'difficulty':
                    if (!field.value) {
                        errorMessage = 'Please select a difficulty level';
                        isValid = false;
                    }
                    break;
                    
                case 'image-url':
                    if (field.value.trim()) {
                        if (!this.isValidUrl(field.value.trim())) {
                            errorMessage = 'Please enter a valid URL starting with http:// or https://';
                            isValid = false;
                        } else if (field.value.trim().length > 500) {
                            errorMessage = 'Image URL must be less than 500 characters';
                            isValid = false;
                        }
                    }
                    break;
            }
            
            if (!isValid) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                field.style.borderColor = 'var(--error-color)';
                field.focus();
            } else {
                errorElement.style.display = 'none';
                field.style.borderColor = 'rgba(139, 95, 191, 0.2)';
            }
            
            return isValid;
        } catch (error) {
            console.error('Error validating field:', error);
            return false;
        }
    },
    
    // Initialize data with sample recipes
    initializeData: function() {
        try {
            const existingData = localStorage.getItem(this.storageKey);
            
            if (!existingData) {
                const sampleRecipes = this.getSampleRecipes();
                this.saveRecipes(sampleRecipes);
                console.log('Sample recipes initialized');
            } else {
                // Validate existing data
                this.validateAndRepairData();
            }
        } catch (error) {
            this.handleCriticalError('Failed to initialize data', error);
        }
    },
    
    // Get sample recipes
    getSampleRecipes: function() {
        return [
            {
                id: 'classic-dal-rice',
                title: "Classic Dal & Rice",
                description: "A comforting and nutritious Indian lentil dish served with fluffy basmati rice.",
                rating: 4,
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
                imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/instant-pot-dal-rice-recipe.jpg"
            },
            {
                id: 'violet-velvet-cake',
                title: "Violet Velvet Cake",
                description: "A stunning purple velvet cake with cream cheese frosting.",
                rating: 4.5,
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
                id: 'paneer-butter-masala',
                title: "Paneer Butter Masala",
                description: "Creamy tomato-based curry with pan-fried paneer cubes—rich, mildly spiced, and perfect with naan or rice.",
                rating: 4.5,
                ingredients: [
                    "300g paneer, cubed",
                    "2 tbsp butter",
                    "1 large onion, finely chopped",
                    "3 tomatoes, pureed",
                    "1 tbsp ginger-garlic paste",
                    "1/2 cup heavy cream",
                    "1 tsp garam masala",
                    "1 tsp red chili powder",
                    "1 tsp kasuri methi (dried fenugreek)",
                    "Salt to taste",
                    "Fresh coriander for garnish"
                ],
                steps: [
                    "Heat butter in a pan and lightly fry paneer cubes until golden; set aside.",
                    "Sauté onions until translucent, add ginger-garlic paste and cook for 1 minute.",
                    "Add tomato puree, spices, and simmer 8-10 minutes until oil separates.",
                    "Stir in cream and kasuri methi, then add paneer and simmer 5 minutes.",
                    "Garnish with coriander and serve with naan or rice."
                ],
                prepTime: 20,
                cookTime: 25,
                difficulty: "medium",
                imageUrl: "https://myfoodstory.com/wp-content/uploads/2021/07/Paneer-Butter-Masala-3.jpg"
            },
            
            {
                id: 'chocolate-banana-bread',
                title: "Chocolate Banana Bread",
                description: "Moist banana bread studded with chocolate chips—great for breakfast or snack time.",
                rating: 5,
                ingredients: [
                    "3 ripe bananas, mashed",
                    "2 cups all-purpose flour",
                    "1/2 cup brown sugar",
                    "1/3 cup melted butter",
                    "2 eggs",
                    "1 tsp baking soda",
                    "1/2 tsp salt",
                    "1 cup chocolate chips",
                    "1 tsp vanilla extract"
                ],
                steps: [
                    "Preheat oven to 350°F (175°C) and grease a loaf pan.",
                    "Mix mashed bananas, melted butter, sugar, eggs, and vanilla until combined.",
                    "Stir in flour, baking soda, and salt until just combined; fold in chocolate chips.",
                    "Pour batter into pan and bake 50-60 minutes or until a toothpick comes out clean.",
                    "Cool before slicing and serve."
                ],
                prepTime: 15,
                cookTime: 55,
                difficulty: "easy",
                imageUrl: "https://bakingamoment.com/wp-content/uploads/2021/02/IMG_0023-chocolate-banana-bread.jpg"
            }
        ];
    },
    
    // Validate and repair corrupted data
    validateAndRepairData: function() {
        try {
            const recipes = this.getRecipes();
            let needsRepair = false;
            
            const validRecipes = recipes.filter(recipe => {
                if (!recipe || typeof recipe !== 'object') {
                    needsRepair = true;
                    return false;
                }
                
                // Validate required fields
                const isValid = 
                    recipe.id && typeof recipe.id === 'string' &&
                    recipe.title && typeof recipe.title === 'string' &&
                    typeof recipe.prepTime === 'number' && recipe.prepTime >= 0 &&
                    typeof recipe.cookTime === 'number' && recipe.cookTime >= 0 &&
                    ['easy', 'medium', 'hard'].includes(recipe.difficulty);
                
                if (!isValid) {
                    needsRepair = true;
                    return false;
                }
                
                return true;
            });
            
            if (needsRepair) {
                console.warn('Corrupted data detected and repaired');
                this.saveRecipes(validRecipes);
                this.showNotification('Data issues detected and fixed automatically', 'info');
            }
            
            return validRecipes;
        } catch (error) {
            console.error('Error validating data:', error);
            // Reset to sample data if validation fails
            localStorage.removeItem(this.storageKey);
            this.initializeData();
            this.showNotification('Data corrupted. Reset to default recipes.', 'error');
            return this.getSampleRecipes();
        }
    },
    
    // Generate a unique ID for recipes
    generateId: function() {
        return 'recipe-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    // Get all recipes from localStorage with error handling
    getRecipes: function() {
        try {
            const recipes = localStorage.getItem(this.storageKey);
            if (!recipes) return [];
            
            const parsed = JSON.parse(recipes);
            if (!Array.isArray(parsed)) {
                throw new Error('Stored data is not an array');
            }
            
            return parsed;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            this.showNotification('Error loading recipes. Using default recipes.', 'error');
            
            // Return sample recipes as fallback
            return this.getSampleRecipes();
        }
    },
    
    // Save recipes to localStorage with comprehensive error handling
    saveRecipes: function(recipes) {
        try {
            // Validate recipes before saving
            if (!Array.isArray(recipes)) {
                throw new Error('Recipes must be an array');
            }
            
            // Check storage quota
            const dataSize = JSON.stringify(recipes).length;
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            
            if (dataSize > maxSize) {
                throw new Error('Storage limit exceeded. Please delete some recipes.');
            }
            
            // Clean and validate each recipe
            const cleanRecipes = recipes.map(recipe => this.cleanRecipeData(recipe));
            
            localStorage.setItem(this.storageKey, JSON.stringify(cleanRecipes));
            return true;
            
        } catch (error) {
            console.error('Error saving recipes:', error);
            
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                this.showNotification('Storage is full. Please delete some recipes to save new ones.', 'error');
            } else if (error.message.includes('Storage limit')) {
                this.showNotification(error.message, 'error');
            } else {
                this.showNotification('Failed to save recipe. Please try again.', 'error');
            }
            
            return false;
        }
    },
    
    // Clean recipe data before saving
    cleanRecipeData: function(recipe) {
        return {
            id: recipe.id || this.generateId(),
            title: (recipe.title || 'Untitled Recipe').slice(0, 100),
            description: (recipe.description || '').slice(0, 500),
            ingredients: (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
                .slice(0, 50)
                .map(ing => ing.slice(0, 200)),
            steps: (Array.isArray(recipe.steps) ? recipe.steps : [])
                .slice(0, 100)
                .map(step => step.slice(0, 500)),
            prepTime: Math.max(0, Math.min(1440, parseInt(recipe.prepTime) || 0)),
            cookTime: Math.max(0, Math.min(1440, parseInt(recipe.cookTime) || 0)),
            difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) ? recipe.difficulty : 'easy',
            imageUrl: (recipe.imageUrl || '').slice(0, 500),
            rating: this.normalizeRating(
                typeof recipe.rating === 'number' ? recipe.rating : parseFloat(recipe.rating) || 0
            )
        };
    },
    
    // Normalize rating values to 0 - 5 with half-star precision
    normalizeRating: function(value) {
        if (isNaN(value)) return 0;
        return Math.max(0, Math.min(5, Math.round(value * 2) / 2));
    },
    
    // Persist rating changes for a recipe
    persistRating: function(recipeId, rating) {
        try {
            const recipes = this.getRecipes();
            const recipeIndex = recipes.findIndex(r => r.id === recipeId);
            if (recipeIndex === -1) return;
            
            recipes[recipeIndex].rating = this.normalizeRating(rating);
            this.saveRecipes(recipes);
        } catch (error) {
            console.error('Error saving rating:', error);
            this.showNotification('Unable to save rating. Please try again.', 'error');
        }
    },
    
    // Show notification with error handling
    showNotification: function(message, type = 'info') {
        try {
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
                max-width: 400px;
                word-wrap: break-word;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
            
        } catch (error) {
            console.error('Error showing notification:', error);
            // Fallback to alert if notification system fails
            alert(`${type.toUpperCase()}: ${message}`);
        }
    },
    
    // Handle critical errors
    handleCriticalError: function(message, error) {
        console.error(`${message}:`, error);
        this.showNotification(`${message}. Please refresh the page.`, 'error');
        
        // Disable form submission on critical errors
        const form = document.getElementById('recipe-form');
        if (form) {
            form.style.opacity = '0.5';
            form.style.pointerEvents = 'none';
        }
    },
    
    // Show a specific view
    showView: function(viewName) {
        try {
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
        } catch (error) {
            this.handleCriticalError('Error changing view', error);
        }
    },
    
    // Render the recipe list with error handling
    renderRecipeList: function() {
        try {
            const recipeList = document.getElementById('recipe-list');
            if (!recipeList) {
                throw new Error('Recipe list element not found');
            }
            
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const difficultyFilter = document.getElementById('difficulty-filter').value;
            const timeFilter = parseInt(document.getElementById('time-filter').value) || 0;
            
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
                
                const addButton = document.getElementById('add-first-recipe');
                if (addButton) {
                    addButton.addEventListener('click', () => {
                        this.showNewRecipeForm();
                    });
                }
                return;
            }
            
            // Render recipe cards
            filteredRecipes.forEach(recipe => {
                try {
                    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
                    
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        ${recipe.imageUrl ? `
                            <img src="${recipe.imageUrl}" alt="${this.escapeHtml(recipe.title)}" class="card-img"
                                 onerror="this.style.display='none'" loading="lazy">
                        ` : ''}
                        <div class="card-content">
                            <h3 class="card-title">${this.escapeHtml(recipe.title)}</h3>
                            <div class="card-meta">
                                        <span>${this.formatDuration(totalTime)}</span>
                                <span class="difficulty difficulty-${recipe.difficulty || 'easy'}">
                                    ${this.escapeHtml((recipe.difficulty || 'easy').charAt(0).toUpperCase() + (recipe.difficulty || 'easy').slice(1))}
                                </span>
                            </div>
                            ${this.renderCardRating(recipe)}
                            <p>${this.escapeHtml(recipe.description || '')}</p>
                            <button class="btn btn-primary view-recipe" data-id="${this.escapeHtml(recipe.id)}">View Recipe</button>
                        </div>
                    `;
                    
                    recipeList.appendChild(card);
                } catch (error) {
                    console.error('Error rendering recipe card:', error);
                }
            });
            
            // Add event listeners to view buttons
            this.attachRecipeEventListeners();
            
        } catch (error) {
            this.handleCriticalError('Error rendering recipe list', error);
        }
    },
    
    // Escape HTML to prevent XSS
    escapeHtml: function(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Format minutes into human readable hours/minutes
    formatDuration: function(totalMinutes) {
        const mins = parseInt(totalMinutes, 10) || 0;
        if (mins <= 0) return '0m';
        if (mins < 60) return `${mins}m`;

        const hours = Math.floor(mins / 60);
        const remainder = mins % 60;
        if (remainder === 0) return `${hours}h`;
        return `${hours}h ${remainder}m`;
    },
    
    // Attach event listeners to recipe cards
    attachRecipeEventListeners: function() {
        try {
            document.querySelectorAll('.view-recipe').forEach(button => {
                button.addEventListener('click', (e) => {
                    const recipeId = e.target.getAttribute('data-id');
                    if (recipeId) {
                        this.showRecipeDetail(recipeId);
                    }
                });
            });
        } catch (error) {
            console.error('Error attaching event listeners:', error);
        }
    },
    
    // Build rating section markup
    renderRatingSection: function(recipe) {
        const rating = this.normalizeRating(recipe.rating || 0);
        const starButtons = Array.from({ length: 5 }, (_, index) => {
            const starNumber = index + 1;
            const label = `Rate ${starNumber} ${starNumber === 1 ? 'star' : 'stars'}`;
            return `<button type="button" class="rating-star" data-star="${starNumber}" aria-label="${label}"></button>`;
        }).join('');
        
        const ratingText = rating > 0 ? `Your rating: ${rating.toFixed(1)} / 5` : 'No rating yet';
        
        return `
            <div class="rating-section" aria-live="polite">
                <div class="rating-stars" id="rating-stars" role="slider" aria-label="Recipe rating" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${rating}">
                    ${starButtons}
                </div>
                <div class="rating-value" id="rating-value">${ratingText}</div>
            </div>
        `;
    },
    
    // Render rating summary for cards
    renderCardRating: function(recipe) {
        const rating = this.normalizeRating(recipe.rating || 0);
        const stars = this.buildStaticStars(rating);
        const text = rating ? `${rating.toFixed(1)}/5` : 'No rating';
        
        return `
            <div class="card-rating" aria-label="Recipe rating ${rating || 0} out of 5">
                <div class="card-rating-stars">
                    ${stars}
                </div>
                <span class="card-rating-value">${text}</span>
            </div>
        `;
    },
    
    // Activate star rating interactions
    initRatingInteraction: function(recipe) {
        const starWrapper = document.getElementById('rating-stars');
        const ratingValue = document.getElementById('rating-value');
        if (!starWrapper || !ratingValue) return;
        
        const stars = Array.from(starWrapper.querySelectorAll('.rating-star'));
        let currentRating = this.normalizeRating(recipe.rating || 0);
        const formatText = (rating, preview = false) => {
            if (!rating) return preview ? '0.0 / 5' : 'No rating yet';
            return `${preview ? '' : 'Your rating: '}${rating.toFixed(1)} / 5`;
        };
        
        const updateDisplay = (rating, options = {}) => {
            const { preview = false } = options;
            
            stars.forEach((star, index) => {
                const starValue = index + 1;
                star.classList.remove('full', 'half', 'empty');
                
                if (rating >= starValue) {
                    star.classList.add('full');
                } else if (rating + 0.5 >= starValue) {
                    star.classList.add('half');
                } else {
                    star.classList.add('empty');
                }
            });
            
            ratingValue.textContent = formatText(rating, preview);
            ratingValue.classList.toggle('rating-preview', preview);
            starWrapper.setAttribute('aria-valuenow', rating);
        };
        
        const computeRatingFromEvent = (star, evt) => {
            if (!star) return currentRating;
            const starValue = parseInt(star.getAttribute('data-star'), 10);
            if (!evt) return starValue;
            
            const rect = star.getBoundingClientRect();
            const isLeftHalf = (evt.clientX - rect.left) <= rect.width / 2;
            const rawRating = isLeftHalf ? starValue - 0.5 : starValue;
            return this.normalizeRating(rawRating);
        };
        
        updateDisplay(currentRating);
        
        starWrapper.addEventListener('pointermove', (evt) => {
            const targetStar = evt.target.closest('.rating-star');
            if (!targetStar) return;
            const hoverRating = computeRatingFromEvent(targetStar, evt);
            updateDisplay(hoverRating, { preview: true });
        });
        
        starWrapper.addEventListener('pointerleave', () => {
            updateDisplay(currentRating);
        });
        
        starWrapper.addEventListener('pointerdown', (evt) => {
            const targetStar = evt.target.closest('.rating-star');
            if (!targetStar) return;
            evt.preventDefault();
            const newRating = computeRatingFromEvent(targetStar, evt);
            currentRating = newRating;
            recipe.rating = newRating;
            updateDisplay(currentRating);
            this.persistRating(recipe.id, currentRating);
        });
    },
    
    // Build static stars for card display
    buildStaticStars: function(rating) {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const state = this.getStarState(rating, starValue);
            return `<span class="static-star ${state}" aria-hidden="true"></span>`;
        }).join('');
    },
    
    // Determine star state (full, half, empty)
    getStarState: function(rating, starValue) {
        if (rating >= starValue) return 'full';
        if (rating + 0.5 >= starValue) return 'half';
        return 'empty';
    },
    
    // Show recipe detail view with error handling
    showRecipeDetail: function(recipeId) {
        try {
            const recipes = this.getRecipes();
            const recipe = recipes.find(r => r.id === recipeId);
            
            if (!recipe) {
                this.showNotification('Recipe not found. It may have been deleted.', 'error');
                this.showView('home');
                this.renderRecipeList();
                return;
            }
            
            const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
            
            const recipeDetail = document.getElementById('recipe-detail');
            recipeDetail.innerHTML = `
                <div class="recipe-header">
                    ${recipe.imageUrl ? `
                        <img src="${recipe.imageUrl}" alt="${this.escapeHtml(recipe.title)}" class="recipe-image"
                             onerror="this.style.display='none'" loading="lazy">
                    ` : ''}
                </div>
                <div class="recipe-info">
                    <h1 class="recipe-title">${this.escapeHtml(recipe.title)}</h1>
                    <p>${this.escapeHtml(recipe.description || '')}</p>
                    
                    <div class="recipe-meta">
                        <div class="meta-item">
                            <span class="meta-label">Prep Time</span>
                            <span class="meta-value">${this.formatDuration(recipe.prepTime || 0)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Cook Time</span>
                            <span class="meta-value">${this.formatDuration(recipe.cookTime || 0)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Total Time</span>
                            <span class="meta-value">${this.formatDuration(totalTime)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Difficulty</span>
                            <span class="difficulty difficulty-${recipe.difficulty || 'easy'}">
                                ${this.escapeHtml((recipe.difficulty || 'easy').charAt(0).toUpperCase() + (recipe.difficulty || 'easy').slice(1))}
                            </span>
                        </div>
                    </div>
                    
                    ${this.renderRatingSection(recipe)}
                    
                    <div class="recipe-section">
                        <h2 class="section-title">Ingredients</h2>
                        <ul class="ingredients-list">
                            ${(recipe.ingredients || []).map(ingredient => 
                                `<li>${this.escapeHtml(ingredient)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="recipe-section">
                        <h2 class="section-title">Steps</h2>
                        <ol class="steps-list">
                            ${(recipe.steps || []).map(step => 
                                `<li>${this.escapeHtml(step)}</li>`
                            ).join('')}
                        </ol>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="edit-recipe" data-id="${this.escapeHtml(recipe.id)}">Edit Recipe</button>
                        <button class="btn btn-danger" id="delete-recipe" data-id="${this.escapeHtml(recipe.id)}">Delete Recipe</button>
                        <button class="btn btn-secondary" id="back-to-list">Back to List</button>
                    </div>
                </div>
            `;
            
            this.initRatingInteraction(recipe);
            
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
            
        } catch (error) {
            this.handleCriticalError('Error showing recipe details', error);
        }
    },
    
    // Show form for adding a new recipe
    showNewRecipeForm: function() {
        try {
            document.getElementById('form-title').textContent = 'Add New Recipe';
            document.getElementById('recipe-form').reset();
            document.getElementById('recipe-id').value = '';
            
            // Clear all error messages
            document.querySelectorAll('.error').forEach(error => {
                error.style.display = 'none';
            });
            
            // Reset border colors
            document.querySelectorAll('input, textarea, select').forEach(field => {
                field.style.borderColor = 'rgba(139, 95, 191, 0.2)';
            });

            // Reset hours/minutes inputs
            const timeFields = ['prep', 'cook'];
            timeFields.forEach(prefix => {
                const h = document.getElementById(`${prefix}-hours`);
                const m = document.getElementById(`${prefix}-minutes`);
                const hidden = document.getElementById(`${prefix}-time`);
                if (h) h.value = '';
                if (m) m.value = '';
                if (hidden) hidden.value = '';
            });
            
            this.showView('form');
        } catch (error) {
            this.handleCriticalError('Error showing new recipe form', error);
        }
    },
    
    // Show form for editing an existing recipe
    showEditRecipeForm: function(recipeId) {
        try {
            const recipes = this.getRecipes();
            const recipe = recipes.find(r => r.id === recipeId);
            
            if (!recipe) {
                this.showNotification('Recipe not found. It may have been deleted.', 'error');
                this.showView('home');
                this.renderRecipeList();
                return;
            }
            
            document.getElementById('form-title').textContent = 'Edit Recipe';
            document.getElementById('recipe-id').value = recipe.id;
            document.getElementById('title').value = recipe.title;
            document.getElementById('description').value = recipe.description || '';
            document.getElementById('ingredients').value = (recipe.ingredients || []).join('\n');
            document.getElementById('steps').value = (recipe.steps || []).join('\n');
            // Populate hours/minutes and hidden total fields
            const prep = recipe.prepTime || 0;
            const cook = recipe.cookTime || 0;
            const ph = Math.floor(prep / 60);
            const pm = prep % 60;
            const ch = Math.floor(cook / 60);
            const cm = cook % 60;
            const prepHEl = document.getElementById('prep-hours');
            const prepMEl = document.getElementById('prep-minutes');
            const cookHEl = document.getElementById('cook-hours');
            const cookMEl = document.getElementById('cook-minutes');
            const prepHidden = document.getElementById('prep-time');
            const cookHidden = document.getElementById('cook-time');
            if (prepHEl) prepHEl.value = ph || '';
            if (prepMEl) prepMEl.value = pm || '';
            if (cookHEl) cookHEl.value = ch || '';
            if (cookMEl) cookMEl.value = cm || '';
            if (prepHidden) prepHidden.value = prep;
            if (cookHidden) cookHidden.value = cook;
            document.getElementById('difficulty').value = recipe.difficulty || 'easy';
            document.getElementById('image-url').value = recipe.imageUrl || '';
            
            // Clear error messages
            document.querySelectorAll('.error').forEach(error => {
                error.style.display = 'none';
            });
            
            this.showView('form');
        } catch (error) {
            this.handleCriticalError('Error showing edit recipe form', error);
        }
    },
    
    // Handle form submission with comprehensive validation
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        try {
            // Show loading state
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="btn-loading"></div> Saving...';
            submitBtn.disabled = true;
            
            // Validate all fields
            const isValid = this.validateForm();
            
            if (!isValid) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.showNotification('Please fix the errors in the form before submitting.', 'error');
                return;
            }
            
            // Get form data
            const recipeData = {
                id: document.getElementById('recipe-id').value || this.generateId(),
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim(),
                ingredients: document.getElementById('ingredients').value.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.trim()),
                steps: document.getElementById('steps').value.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.trim()),
                // Compute minutes from hours+minutes inputs (fallback to hidden fields)
                prepTime: (function(){
                    const ph = parseInt((document.getElementById('prep-hours') || { value: 0 }).value) || 0;
                    const pm = parseInt((document.getElementById('prep-minutes') || { value: 0 }).value) || 0;
                    const total = ph * 60 + pm;
                    return total;
                })(),
                cookTime: (function(){
                    const ch = parseInt((document.getElementById('cook-hours') || { value: 0 }).value) || 0;
                    const cm = parseInt((document.getElementById('cook-minutes') || { value: 0 }).value) || 0;
                    const total = ch * 60 + cm;
                    return total;
                })(),
                difficulty: document.getElementById('difficulty').value || 'easy',
                imageUrl: document.getElementById('image-url').value.trim()
            };
            
            const recipes = this.getRecipes();
            const existingIndex = recipes.findIndex(r => r.id === recipeData.id);
            const isEdit = existingIndex !== -1;
            recipeData.rating = isEdit 
                ? this.normalizeRating(recipes[existingIndex].rating || 0)
                : 0;
            
            if (isEdit) {
                recipes[existingIndex] = recipeData;
            } else {
                recipes.push(recipeData);
            }
            
            if (this.saveRecipes(recipes)) {
                this.showNotification(
                    `Recipe "${recipeData.title}" ${isEdit ? 'updated' : 'added'} successfully!`, 
                    'success'
                );
                this.showView('home');
                this.renderRecipeList();
            }
            
        } catch (error) {
            this.handleCriticalError('Error saving recipe', error);
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-text">Save Recipe</span><div class="btn-loading"></div>';
                submitBtn.disabled = false;
            }
        }
    },
    
    // Validate entire form
    validateForm: function() {
        let isValid = true;
        
        const requiredFields = [
            'title', 'description', 'ingredients', 'steps', 
            'prep-time', 'cook-time', 'difficulty'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate image URL if provided
        const imageUrlField = document.getElementById('image-url');
        if (imageUrlField.value && !this.validateField(imageUrlField)) {
            isValid = false;
        }
        
        return isValid;
    },
    
    // Check if a string is a valid URL
    isValidUrl: function(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    },
    
    // Delete a recipe with confirmation and error handling
    deleteRecipe: function(recipeId) {
        try {
            if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
                return;
            }
            
            const recipes = this.getRecipes();
            const recipeIndex = recipes.findIndex(r => r.id === recipeId);
            
            if (recipeIndex === -1) {
                this.showNotification('Recipe not found. It may have already been deleted.', 'error');
                this.showView('home');
                this.renderRecipeList();
                return;
            }
            
            const recipeTitle = recipes[recipeIndex].title;
            recipes.splice(recipeIndex, 1);
            
            if (this.saveRecipes(recipes)) {
                this.showNotification(`Recipe "${recipeTitle}" deleted successfully!`, 'success');
                this.showView('home');
                this.renderRecipeList();
            }
            
        } catch (error) {
            this.handleCriticalError('Error deleting recipe', error);
        }
    }
};