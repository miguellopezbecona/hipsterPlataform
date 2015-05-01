package hipster;

/**
 *
 * @author Miguel
 */
public class Link {
    private String source;
    private String target;
    private double weight;

    public Link(String source, String target, double weight) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }

    public Link() {
    }


    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }
    
}
