class Tense {

    #tense_id;
    #tense_name;
    #description;
    #time_group;        // Present, Past, Future
    #subcategory;       // Simple, Continuous, Perfect, Perfect Continuous
    #grammar_rules;     // Rich text for grammar rules explanation
    #example_structure; // Template for sentence structure
    #usage_notes;       // When and how to use this tense
    #difficulty_level;  // 1 (Easy) to 5 (Hard)
    #active;            // Whether this tense is active in the UI

    constructor(upload, bddrow, bodyjson) {
        if (upload) {
            this.#tense_id = upload.tense_id;
            this.#tense_name = upload.tense_name;
            this.#description = upload.description;
            this.#time_group = upload.time_group;
            this.#subcategory = upload.subcategory;
            this.#grammar_rules = upload.grammar_rules;
            this.#example_structure = upload.example_structure;
            this.#usage_notes = upload.usage_notes;
            this.#difficulty_level = upload.difficulty_level || 3;
            this.#active = upload.active !== undefined ? upload.active : true;
        } else if (bddrow) {
            this.#tense_id = bddrow.id;
            this.#tense_name = bddrow.tense_name;
            this.#description = bddrow.tense_description;
            this.#time_group = bddrow.time_group;
            this.#subcategory = bddrow.subcategory;
            this.#grammar_rules = bddrow.grammar_rules;
            this.#example_structure = bddrow.example_structure;
            this.#usage_notes = bddrow.usage_notes;
            this.#difficulty_level = bddrow.difficulty_level || 3;
            this.#active = bddrow.active !== undefined ? bddrow.active : true;
        } else if (bodyjson) {
            this.#tense_name = bodyjson.tense_name;
            this.#description = bodyjson.tense_description;
            if (bodyjson.tense_id)
                this.#tense_id = bodyjson.tense_id;
            this.#time_group = bodyjson.time_group;
            this.#subcategory = bodyjson.subcategory;
            this.#grammar_rules = bodyjson.grammar_rules;
            this.#example_structure = bodyjson.example_structure;
            this.#usage_notes = bodyjson.usage_notes;
            this.#difficulty_level = bodyjson.difficulty_level || 3;
            this.#active = bodyjson.active !== undefined ? bodyjson.active : true;
        } else {
            this.#tense_id = null;
            this.#tense_name = null;
            this.#description = null;
            this.#time_group = null;
            this.#subcategory = null;
            this.#grammar_rules = null;
            this.#example_structure = null;
            this.#usage_notes = null;
            this.#difficulty_level = 3;
            this.#active = true;
        }
    }

    toObject() {
        return {
            tense_id: this.#tense_id,
            tense_name: this.#tense_name,
            description: this.#description,
            time_group: this.#time_group,
            subcategory: this.#subcategory,
            grammar_rules: this.#grammar_rules,
            example_structure: this.#example_structure,
            usage_notes: this.#usage_notes,
            difficulty_level: this.#difficulty_level,
            active: this.#active
        };
    }

    get tense_id() { return this.#tense_id; }
    get tense_name() { return this.#tense_name; }
    get description() { return this.#description; }
    get time_group() { return this.#time_group; }
    get subcategory() { return this.#subcategory; }
    get grammar_rules() { return this.#grammar_rules; }
    get example_structure() { return this.#example_structure; }
    get usage_notes() { return this.#usage_notes; }
    get difficulty_level() { return this.#difficulty_level; }
    get active() { return this.#active; }

    set tense_id(id) { this.#tense_id = id; }
    set tense_name(name) { this.#tense_name = name; }
    set description(desc) { this.#description = desc; }
    set time_group(group) { this.#time_group = group; }
    set subcategory(subcat) { this.#subcategory = subcat; }
    set grammar_rules(rules) { this.#grammar_rules = rules; }
    set example_structure(structure) { this.#example_structure = structure; }
    set usage_notes(notes) { this.#usage_notes = notes; }
    set difficulty_level(level) { this.#difficulty_level = level; }
    set active(isActive) { this.#active = isActive; }
}

module.exports = Tense;
