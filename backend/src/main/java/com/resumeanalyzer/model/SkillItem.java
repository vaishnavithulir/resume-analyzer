package com.resumeanalyzer.model;

public record SkillItem(
        String name,
        SkillCategory category
) implements Comparable<SkillItem> {
    @Override
    public int compareTo(SkillItem other) {
        int catCompare = this.category.compareTo(other.category);
        if (catCompare != 0) {
            return catCompare;
        }
        return this.name.compareToIgnoreCase(other.name);
    }
}
